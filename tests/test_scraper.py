import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch
from bs4 import BeautifulSoup

from scraper import ai_client, translator, main
from scraper.fetcher import _parse_menu_text, extract_service_hours, RESTAURANTS, MEAL_MAP, MEAL_CN


def restaurant(rid):
    return {'id': rid, **RESTAURANTS[rid], 'meals': {key: {'label_ko': label, 'label_cn': MEAL_CN[key], 'sections': []} for key, label in MEAL_MAP.items()}}


class TranslationTests(unittest.TestCase):
    def test_duplicates_use_one_request_and_keep_input_order(self):
        cache = {}
        with patch.object(translator, '_translate_and_review_batch', return_value=['泡菜', '白米饭']) as api, patch.object(translator, '_save_cache'):
            result = translator.translate_concurrent(['김치', '쌀밥', '김치'], 'test-key', 'https://example.invalid', cache)
        self.assertEqual(result, ['泡菜', '白米饭', '泡菜'])
        self.assertEqual(api.call_count, 1)
        self.assertEqual(api.call_args.args[0], ['김치', '쌀밥'])

    def test_failure_is_not_cached_and_next_run_retries(self):
        cache = {}
        with patch.object(translator, '_translate_and_review_batch', side_effect=translator.TranslationError('HTTP 429')), patch.object(translator, '_save_cache'):
            self.assertEqual(translator.translate_concurrent(['김치'], 'test-key', 'https://example.invalid', cache), [''])
        self.assertEqual(cache, {})
        with patch.object(translator, '_translate_and_review_batch', return_value=['泡菜']) as api, patch.object(translator, '_save_cache'):
            self.assertEqual(translator.translate_concurrent(['김치'], 'test-key', 'https://example.invalid', cache), ['泡菜'])
            self.assertEqual(api.call_count, 1)

    def test_bad_response_cannot_silently_misalign_translations(self):
        for content in ['["泡菜"]', '["泡菜", "쌀밥"]', '{"0":"泡菜"}', 'not JSON']:
            with self.subTest(content=content), self.assertRaises(translator.TranslationError):
                translator._parse_response(content, ['김치', '쌀밥'])

    def test_critical_menu_terms_preserve_meal_and_unspecified_ingredients(self):
        self.assertFalse(translator.is_valid_translation('증식(6,500원): 11:00~14:00', '加餐(6,500韩元): 11:00~14:00'))
        self.assertTrue(translator.is_valid_translation('증식(6,500원): 11:00~14:00', '午餐(6,500韩元): 11:00~14:00'))
        self.assertFalse(translator.is_valid_translation('장조림버터볶음밥', '酱牛肉黄油炒饭'))
        self.assertTrue(translator.is_valid_translation('소고기장조림', '酱卤牛肉'))

    def test_legacy_poisoned_cache_is_invalidated(self):
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory) / 'cache.json'
            cache.write_text(json.dumps({'김치': '김치'}), encoding='utf-8')
            with patch.object(translator, 'CACHE_PATH', cache):
                self.assertEqual(translator._load_cache(), {})
                translator._save_cache({'김치': '泡菜'})
                self.assertEqual(translator._load_cache(), {'김치': '泡菜'})
                self.assertEqual(translator._load_cache(model='other-model'), {})

    def test_rate_limit_retries_but_auth_error_does_not(self):
        response = Mock(ok=True, status_code=200)
        response.json.return_value = {'choices': [{'message': {'content': '["泡菜"]'}}]}
        limited = Mock(ok=False, status_code=429, headers={'Retry-After': '1'})
        client = Mock()
        client.post.side_effect = [limited, response]
        with patch.object(ai_client, '_session', return_value=client), patch.object(ai_client.time, 'sleep'):
            self.assertEqual(translator._call_batch(['김치'], 'test-key', 'https://example.invalid', 'test-model'), ['泡菜'])
        self.assertEqual(client.post.call_count, 2)
        client.post.reset_mock()
        client.post.side_effect = None
        client.post.return_value = Mock(ok=False, status_code=401)
        with patch.object(ai_client, '_session', return_value=client), self.assertRaises(translator.TranslationError):
            translator._call_batch(['김치'], 'test-key', 'https://example.invalid', 'test-model')
        self.assertEqual(client.post.call_count, 1)


class PartialTranslationTests(unittest.TestCase):
    def test_valid_batch_items_survive_and_only_missing_text_is_retried(self):
        cache = {}
        with patch.object(translator, '_translate_and_review_batch', side_effect=[['泡菜', ''], ['白米饭']]) as api, patch.object(translator, '_save_cache'):
            result = translator.translate_concurrent(['김치', '쌀밥', '김치'], 'test-key', 'https://example.invalid', cache)
        self.assertEqual(result, ['泡菜', '白米饭', '泡菜'])
        self.assertEqual([c.args[0] for c in api.call_args_list], [['김치', '쌀밥'], ['쌀밥']])

    def test_partial_parser_still_rejects_wrong_count(self):
        with self.assertRaises(translator.TranslationError):
            translator._parse_response('["泡菜"]', ['김치', '쌀밥'], allow_partial=True)
        self.assertEqual(translator._parse_response('["泡菜", "쌀밥"]', ['김치', '쌀밥'], allow_partial=True), ['泡菜', ''])


class FetchTests(unittest.TestCase):
    def test_failed_restaurant_keeps_its_id_and_explicit_status(self):
        def fetch(date, rid):
            if rid == 363910:
                raise TimeoutError()
            return restaurant(rid)
        with patch.object(main, 'fetch_menu', side_effect=fetch):
            day = main.fetch_single_day('2026-10-14')
        self.assertEqual([entry['id'] for entry in day['restaurants']], [363910, 221904])
        self.assertEqual([entry['fetch_status'] for entry in day['restaurants']], ['error', 'ok'])

    def test_stale_fallback_only_uses_the_same_day_and_copies_data(self):
        old = restaurant(363910)
        old['meals']['lunch']['sections'] = [{'name_ko': '중식', 'name_cn': '午餐', 'items': [{'ko': '쌀밥', 'cn': '白米饭', 'calories': 325}]}]
        previous = {'days': {'2026-10-14': {'restaurants': [old], 'generated_at': '2026-10-14T00:00:00+09:00'}}}
        with patch.object(main, 'fetch_menu', side_effect=TimeoutError()):
            day = main.fetch_single_day('2026-10-14', previous)
            other = main.fetch_single_day('2026-10-15', previous)
        self.assertEqual(day['restaurants'][0]['fetch_status'], 'stale')
        self.assertEqual(other['restaurants'][0]['fetch_status'], 'error')
        self.assertNotIn('fetch_status', old)
        item = day['restaurants'][0]['meals']['lunch']['sections'][0]['items'][0]
        self.assertEqual(item, {'ko': '쌀밥', 'cn': '白米饭', 'kind': 'dish'})
        self.assertEqual(old['meals']['lunch']['sections'][0]['items'][0]['calories'], 325)

    def test_parser_preserves_unsectioned_notices_and_menu_text(self):
        sections = _parse_menu_text('* 운영 안내\n<중식>\n쌀밥\n김치')
        self.assertEqual(len(sections), 2)
        self.assertEqual(sections[1]['items'][1]['ko'], '김치')
        self.assertEqual(_parse_menu_text('등록된 식단이 없습니다'), [])

    def test_service_hours_prefer_daily_notices_over_location_and_fallbacks(self):
        soup = BeautifulSoup('<div class="b-location-box"><pre>아침 08:00 - 09:50\n점심 11:00 - 14:00\n저녁 16:30 - 18:30</pre></div><div class="b-menu-day breakfast"><pre>조식: 7:00~8:00\n중식(6500원): 11:00~13:30</pre></div>', 'lxml')
        hours = extract_service_hours(soup, 363910)
        self.assertEqual(hours['breakfast'], {'start': '07:00', 'end': '08:00', 'source': 'daily_menu'})
        self.assertEqual(hours['lunch']['end'], '13:30')
        self.assertEqual(hours['dinner']['end'], '18:30')

    def test_staff_hours_ignore_seasonal_overview_and_handle_typo_and_closure(self):
        soup = BeautifulSoup('<div class="b-location-box"><pre>중식: 11:00~14:00 / 석식: 17:00~19:00\n방학중 석식: 미운영</pre></div><div class="b-menu-day breakfast"><pre>증식(6,500원): 11:00~14:00\n석식(6500원): 16:30~18:40\n테이크아웃: 11:00~14:00</pre></div>', 'lxml')
        hours = extract_service_hours(soup, 221904)
        self.assertNotIn('breakfast', hours)
        self.assertEqual(hours['dinner'], {'start': '16:30', 'end': '18:40', 'source': 'daily_menu'})
        closed = BeautifulSoup('<div class="b-menu-day"><pre>석식: 미운영</pre></div>', 'lxml')
        self.assertIsNone(extract_service_hours(closed, 221904)['dinner'])


class RunScheduleTests(unittest.TestCase):
    @staticmethod
    def _day(date, status='ok'):
        return {'date': date, 'generated_at': f'{date}T00:00:00+09:00', 'restaurants': [
            {'id': rid, 'fetch_status': status, 'meals': {}} for rid in RESTAURANTS]}

    def test_served_days_are_reused_and_today_onward_is_fetched(self):
        previous = {'days': {d: self._day(d) for d in ('2026-11-23', '2026-11-24')}}
        previous['days']['2026-11-25'] = self._day('2026-11-25', status='error')
        with patch.object(main, '_load_previous', return_value=previous),                 patch.object(main, 'fetch_single_day', side_effect=lambda d, _p: self._day(d)) as fetch,                 patch.object(main, 'translate_menu'), patch.object(main, '_write_json') as write,                 patch.dict('os.environ', {'REQUIRE_TRANSLATION': '0', 'TRANSLATE_API_KEY': ''}):
            main.run('2026-11-26')
        fetched = [call.args[0] for call in fetch.call_args_list]
        # 11-23/24 were served and published; 11-25 failed before, so it is fetched again.
        self.assertEqual(fetched, ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'])
        self.assertEqual(sorted(write.call_args.args[1]['days']), [f'2026-11-{n}' for n in range(23, 30)])

    def test_all_failed_fetches_raise_for_an_explicit_date(self):
        with patch.object(main, '_load_previous', return_value={'generated_at': '2026-11-26T00:00:00+09:00'}),                 patch.object(main, 'fetch_single_day', side_effect=lambda d, _p: self._day(d, status='error')),                 patch.object(main, '_write_json') as write:
            with self.assertRaisesRegex(RuntimeError, 'All restaurant fetches failed'):
                main.run('2026-11-26')
        write.assert_not_called()

    def test_retry_run_skips_when_today_was_already_published(self):
        with patch.object(main, '_load_previous', return_value={'generated_at': '2026-11-26T00:03:00+09:00'}),                 patch.object(main, 'fetch_single_day') as fetch, patch.dict('os.environ', {'MENU_RETRY_RUN': '1'}):
            main.run('2026-11-26')
        fetch.assert_not_called()

    def test_a_few_stubborn_translations_do_not_block_publishing(self):
        def day(date):
            items = [{'ko': f'메뉴{date}-{n}', 'cn': ''} for n in range(10)]
            if date == '2026-10-21':
                items[0]['ko'] = '고집센메뉴'
            return {'date': date, 'generated_at': '', 'restaurants': [
                {'id': rid, 'fetch_status': 'ok', 'name_ko': '', 'location_ko': '',
                 'meals': {'lunch': {'sections': [{'name_ko': 'A', 'name_cn': 'A', 'items': [dict(i) for i in items]}]}}}
                for rid in RESTAURANTS]}

        def translate(restaurants, *_args, **_kwargs):
            for restaurant in restaurants:
                for item in restaurant['meals']['lunch']['sections'][0]['items']:
                    item['cn'] = '' if item['ko'] == '고집센메뉴' else '菜'

        settings = {'REQUIRE_TRANSLATION': '1', 'TRANSLATE_API_KEY': 'test-key'}
        with patch.object(main, '_load_previous', return_value={}), patch.object(main, 'fetch_single_day', side_effect=lambda d, _p: day(d)),                 patch.object(main, 'translate_menu', side_effect=translate), patch.object(main, '_write_json') as write,                 patch.dict('os.environ', settings):
            main.run('2026-10-21')
        self.assertEqual(write.call_args.args[1]['translation']['status'], 'partial')

    def test_recent_publication_window(self):
        now = main.datetime(2026, 11, 28, 0, 0, tzinfo=main.KST)
        self.assertTrue(main._published_recently({'generated_at': '2026-11-27T23:01:00+09:00'}, now))
        self.assertFalse(main._published_recently({'generated_at': '2026-11-26T12:00:00+09:00'}, now))
        self.assertFalse(main._published_recently({}, now))


class ReaderKeyTests(unittest.TestCase):
    def test_optional_reader_key_is_sent_only_to_reader(self):
        from scraper import fetcher
        url = fetcher.URL_TEMPLATE.format(article_no=363910, date='2026-11-26')
        reply = Mock(status_code=200, content=b'{}', headers={})
        reply.json.return_value = {'code': 200, 'data': {'httpStatus': 200, 'url': url, 'html': '<html></html>'}}
        with patch.dict('os.environ', {'JINA_API_KEY': 'jina_test'}), patch.object(fetcher, '_pace_reader_request'),                 patch.object(fetcher._READER_SESSION, 'get', return_value=reply) as get:
            fetcher._read_reader_html(url, 363910, '2026-11-26')
        self.assertEqual(get.call_args.kwargs['headers']['Authorization'], 'Bearer jina_test')


if __name__ == '__main__':
    unittest.main()
