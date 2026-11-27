'use strict';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const RESTAURANTS = [
  { id: 363910, name_ko: '기숙사식당', name_cn: '宿舍食堂', location_ko: '기숙사식당 1층', location_cn: '宿舍食堂 1 楼' },
  { id: 221904, name_ko: '교직원식당', name_cn: '教职工食堂', location_ko: '기숙사식당동 2층', location_cn: '宿舍食堂楼 2 层' },
];
const DEFAULT_SERVICE_HOURS = {
  363910: { breakfast: { start: '08:00', end: '09:50' }, lunch: { start: '11:00', end: '14:00' }, dinner: { start: '16:30', end: '18:30' } },
  221904: { lunch: { start: '11:00', end: '14:00' }, dinner: { start: '17:00', end: '18:40' } },
};
const COPY = {
  ko: {
    brand: '아주대학교 식단', tools: '설정', done: '완료', now: '지금',
    restaurant: '식당 선택', meal: '식사 선택', calendar: '날짜 선택',
    todayLabel: '오늘', tomorrowLabel: '내일', thisWeek: '이번 주', nextWeek: '다음 주', nextWeekHint: '밀어서 다음 주 →',
    refresh: '메뉴 새로고침', refreshing: '새로고침 중…', refreshOffline: '오프라인에서는 새로고침할 수 없어요. 인터넷에 연결한 뒤 다시 시도해 주세요.',
    offlineBanner: '오프라인 상태라 저장된 메뉴를 보여드려요.',
    cachedBanner: '저장된 메뉴를 보여드리고 있어요. 최신 메뉴는 설정에서 새로고침해 주세요.',
    old: '메뉴가 한동안 업데이트되지 않았어요. 최신 정보는 학교 원문을 확인해 주세요.',
    noData: '메뉴 데이터를 불러오지 못했어요. 잠시 후 새로고침해 주세요.',
    serving: '운영 중', servingReference: '운영 중', upcoming: '운영 전', ended: '운영 종료', preview: '예정 메뉴', closed: '운영 안 함', emptyService: '메뉴 없음', unconfirmed: '운영 여부 확인 필요', unknownService: '운영시간 미확인',
    reference: '참고', breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '분식',
    empty: '등록된 메뉴가 없어요', emptyDescription: '다른 식사나 날짜를 선택해 보세요.', holidayClosed: '주말·공휴일 휴무', closedDescription: '이날은 식당을 운영하지 않아요.',
    notPublished: '아직 메뉴가 올라오지 않았어요', notPublishedDescription: '학교에서 식단을 게시하면 자동으로 업데이트돼요.',
    unavailableMeal: meal => `${meal}은 운영하지 않아요`, unavailableDescription: '위에서 다른 식사를 선택해 보세요.',
    fetchError: '이 식당의 메뉴를 불러오지 못했어요. 학교 원문을 확인해 주세요.', missing: '이 날짜의 데이터가 없어요. 학교 원문을 확인해 주세요.', futureMissing: '이 날짜의 메뉴 정보가 아직 없어요.',
    savedMenu: '학교 페이지에서 이 날짜 메뉴가 사라져, 이전에 저장한 메뉴를 보여드려요.', staleRestaurant: '최신 메뉴를 가져오지 못해 이전에 저장한 메뉴를 보여드려요.',
    translationMissing: '일부 번역이 준비되지 않아 한국어 원문으로 표시해요.',
    updated: '업데이트', footer: '비공식 식단 안내 · 실제 메뉴는 학교 공지를 따릅니다',
    disclaimer: '아주대학교와 무관한 비공식 오픈소스 식단 안내입니다. 매일 00:00(KST)에 학교 공지를 자동으로 가져와요.',
    share: '메뉴 복사', copied: '메뉴를 복사했어요', copyHint: '자동 복사가 불가능해요. 아래 내용을 길게 눌러 복사해 주세요.',
    close: '닫기', operating: '운영 안내', source: '학교 원문 보기', skip: '메뉴로 바로가기',
    weekdays: ['월', '화', '수', '목', '금', '토', '일'],
  },
  cn: {
    brand: '亚洲大学食堂', tools: '设置', done: '完成', now: '现在',
    restaurant: '选择食堂', meal: '选择餐次', calendar: '选择日期',
    todayLabel: '今天', tomorrowLabel: '明天', thisWeek: '本周', nextWeek: '下周', nextWeekHint: '左滑看下周 →',
    refresh: '刷新菜单', refreshing: '正在刷新…', refreshOffline: '当前离线，无法刷新。请联网后再试。',
    offlineBanner: '当前离线，显示的是已保存的菜单。',
    cachedBanner: '显示的是已保存的菜单，可在设置里刷新获取最新内容。',
    old: '菜单有一段时间没更新了，最新安排请以学校原文为准。',
    noData: '菜单数据加载失败，请稍后刷新。',
    serving: '供餐中', servingReference: '供餐中', upcoming: '未开始', ended: '已结束', preview: '预告', closed: '不供应', emptyService: '暂无菜单', unconfirmed: '供餐待确认', unknownService: '时间待确认',
    reference: '参考', breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '小吃',
    empty: '暂时没有这份菜单', emptyDescription: '换个餐次或日期看看。', holidayClosed: '节假日不营业', closedDescription: '这一天食堂休息。',
    notPublished: '菜单还没公布', notPublishedDescription: '学校公布后会自动更新。',
    unavailableMeal: meal => `今天不供应${meal}`, unavailableDescription: '可以在上方切换其他餐次。',
    fetchError: '这间食堂的菜单暂时获取失败，请查看学校原文。', missing: '这一天暂无数据，请查看学校原文。', futureMissing: '这一天的菜单还没有数据。',
    savedMenu: '学校页面已撤下这天的菜单，显示的是之前保存的版本。', staleRestaurant: '本次没能获取最新菜单，显示的是之前保存的版本。',
    translationMissing: '部分译文暂缺，先显示韩文原名。',
    updated: '更新于', footer: '非官方菜单助手 · 实际供应以学校公告为准',
    disclaimer: '这是与亚洲大学无关的非官方开源菜单助手，每天 00:00（韩国时间）自动同步学校公告。',
    share: '复制菜单', copied: '已复制菜单', copyHint: '无法自动复制，请长按下面的内容手动复制。',
    close: '关闭', operating: '营业说明', source: '查看学校原文', skip: '跳到菜单',
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
  },
};
const ICONS = {
  bowl: '<path d="M3 10h18c0 7-4 11-9 11S3 17 3 10ZM2 10h20M7 2v4m5-5v5m5-4v4"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5M5.5 7a7 7 0 0 1 11.7-2L20 8M4 16l2.8 3A7 7 0 0 0 18.5 17"/>',
  right: '<path d="m10 6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8"/>',
  more: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3 3 0 0 0-1-2c3-.3 6-1.5 6-6a5 5 0 0 0-1.5-3.5A5 5 0 0 0 18 3s-1.5-.5-4 1a14 14 0 0 0-6 0C5.5 2.5 4 3 4 3a5 5 0 0 0-.5 3.5A5 5 0 0 0 2 10c0 4.5 3 5.7 6 6a3 3 0 0 0-1 2v4"/>',
};

function getKstDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function getKstMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  return Number(parts.find(part => part.type === 'hour').value) * 60 + Number(parts.find(part => part.type === 'minute').value);
}
function nextDate(date) { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + 1); return value.toISOString().slice(0, 10); }
function validDate(date) { return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(new Date(`${date}T12:00:00Z`).getTime()) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date; }
function clockMinutes(clock) { const [hour, minute] = clock.split(':').map(Number); return hour * 60 + minute; }
function serviceHours(restaurant, restaurantId) {
  const hours = Object.fromEntries(Object.entries(DEFAULT_SERVICE_HOURS[restaurantId] || DEFAULT_SERVICE_HOURS[363910]).map(([meal, value]) => [meal, { ...value, source: 'fallback' }]));
  for (const meal of ['breakfast', 'lunch', 'dinner']) {
    const value = restaurant?.service_hours?.[meal];
    if (value === null) hours[meal] = null;
    else if (value && /^[0-2]\d:[0-5]\d$/.test(value.start) && /^[0-2]\d:[0-5]\d$/.test(value.end) && clockMinutes(value.start) < clockMinutes(value.end) && clockMinutes(value.end) < 1440) hours[meal] = { start: value.start, end: value.end, source: ['daily_menu', 'restaurant_notice'].includes(value.source) ? value.source : 'fallback' };
  }
  return hours;
}
function findRestaurant(schedule, date, restaurantId) { return schedule.weeks.find(week => week.days[date])?.days[date]?.restaurants?.find(restaurant => Number(restaurant.id) === restaurantId); }
function dataFreshness(value, now = new Date()) {
  if (!buildSchedule(value, now).weeks.length) return 'missing';
  const age = now.getTime() - new Date(value?.generated_at).getTime();
  if (!Number.isFinite(age) || age < -5 * 60 * 1000) return 'unknown';
  return age > 36 * 60 * 60 * 1000 ? 'old' : 'fresh';
}
function serviceStatus(restaurant, restaurantId, date, meal, section, now = new Date(), fresh = true) {
  if (!restaurant || restaurant.fetch_status === 'error') return 'emptyService';
  if (!fresh || restaurant.fetch_status === 'stale') return 'unconfirmed';
  const hours = serviceHours(restaurant, restaurantId)[meal];
  if (hours === null) return 'closed';
  if (!(section?.items || []).some(item => !isNotice(item))) return 'emptyService';
  if (date > getKstDate(now)) return 'preview';
  if (date < getKstDate(now)) return 'ended';
  if (!hours) return 'unknownService';
  const minutes = getKstMinutes(now);
  if (minutes < clockMinutes(hours.start)) return 'upcoming';
  if (minutes >= clockMinutes(hours.end)) return 'ended';
  return hours.source === 'fallback' ? 'servingReference' : 'serving';
}
function firstServiceMeal(schedule, date, restaurantId) {
  const hours = serviceHours(findRestaurant(schedule, date, restaurantId), restaurantId);
  return ['breakfast', 'lunch', 'dinner'].find(meal => hours[meal]) || Object.keys(DEFAULT_SERVICE_HOURS[restaurantId] || DEFAULT_SERVICE_HOURS[363910])[0];
}
function selectDefaultMenu(data, restaurantId = 363910, now = new Date()) {
  const schedule = buildSchedule(data, now);
  const today = schedule.today;
  const hours = serviceHours(findRestaurant(schedule, today, restaurantId), restaurantId);
  const minutes = getKstMinutes(now);
  const meal = ['breakfast', 'lunch', 'dinner'].find(key => hours[key] && minutes < clockMinutes(hours[key].end));
  const date = meal ? today : nextDate(today);
  return { restaurantId, date, meal: meal || firstServiceMeal(schedule, date, restaurantId), week: schedule.weeks.find(week => week.days[date])?.key || schedule.initialWeek };
}
function initialSelection(data, query = '', now = new Date()) {
  const params = new URLSearchParams(query);
  const requestedId = Number(params.get('restaurant'));
  const restaurantId = RESTAURANTS.some(info => info.id === requestedId) ? requestedId : 363910;
  const automatic = selectDefaultMenu(data, restaurantId, now);
  const date = validDate(params.get('date')) ? params.get('date') : automatic.date;
  const meal = MEAL_ORDER.includes(params.get('meal')) ? params.get('meal') : date === automatic.date ? automatic.meal : firstServiceMeal(buildSchedule(data, now), date, restaurantId);
  const linked = validDate(params.get('date')) || MEAL_ORDER.includes(params.get('meal')) || params.has('window');
  return { restaurantId, date, meal, week: buildSchedule(data, now).weeks.find(week => week.days[date])?.key || automatic.week, sectionName: params.get('window'), automatic: !linked, linked };
}

function buildSchedule(data, now = new Date()) {
  const validDays = days => Object.fromEntries(Object.entries(days || {}).filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort(([a], [b]) => a.localeCompare(b)));
  const weeks = [{ key: 'this', days: validDays(data?.days) }, { key: 'next', days: validDays(data?.next_week?.days) }]
    .map(week => ({ ...week, dates: Object.keys(week.days) })).filter(week => week.dates.length);
  const today = getKstDate(now);
  const day = new Date(`${today}T12:00:00+09:00`).getUTCDay();
  const activeWeek = weeks.find(week => week.dates.includes(today)) || ((day === 0 || day === 6) && weeks.find(week => week.key === 'next')) || weeks[0];
  return { weeks, today, initialWeek: activeWeek?.key || 'this', initialDate: activeWeek?.dates.includes(today) ? today : activeWeek?.dates[0] || '' };
}

function isNotice(item) {
  if (item.kind === 'note') return true;
  return /^(?:\s*[*※]|\s*\()|위 메뉴|시장 상황|운영시간|예약 가능합니다|픽업시간|단일코너.*운영|원하는 토핑|간편식 판매|(?:중식|증식|석식|테이크아웃)\s*\([\d,]+원\)/.test(item.ko || '');
}
function hasEmptyMeals(restaurant) {
  return MEAL_ORDER.every(key => {
    const sections = restaurant.meals?.[key]?.sections;
    return Array.isArray(sections) && !sections.some(section => section.items?.some(item => !isNotice(item)));
  });
}
function isClosedDay(restaurant, date) {
  if (restaurant?.fetch_status !== 'ok' || !hasEmptyMeals(restaurant)) return false;
  if (restaurant.menu_status === 'closed' && restaurant.closure?.source === 'daily_menu' && restaurant.closure.text?.trim()) return true;
  if (restaurant.menu_status && !['empty', 'closed'].includes(restaurant.menu_status)) return false;
  // Keep the requested weekend fallback; empty weekdays need explicit evidence.
  return validDate(date) && [0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay());
}
function isUnpublishedDay(restaurant, date, today = getKstDate()) {
  return restaurant?.fetch_status === 'ok' && hasEmptyMeals(restaurant) && !isClosedDay(restaurant, date)
    && (restaurant.menu_status === 'not_published' || (validDate(date) && date >= today && restaurant.menu_status !== 'unavailable'));
}
function availableMeals(restaurant) { return MEAL_ORDER.filter(key => restaurant?.meals?.[key]?.sections?.some(section => section.items?.some(item => !isNotice(item)))); }
function unavailableMeal(restaurant, meal) { const meals = availableMeals(restaurant); return restaurant?.fetch_status === 'ok' && meals.length > 0 && !meals.includes(meal); }
function operatingNotices(restaurant) {
  const meals = availableMeals(restaurant);
  const seen = new Set();
  return MEAL_ORDER.filter(meal => !meals.includes(meal)).flatMap(meal => restaurant?.meals?.[meal]?.sections || []).flatMap(section => section.items || []).filter(item => {
    if (!isNotice(item) || seen.has(item.ko)) return false;
    seen.add(item.ko); return true;
  });
}
function validTranslation(original, translated) { return typeof translated === 'string' && translated.trim() !== '' && !/[가-힣]/.test(translated) && (translated !== original || !/[가-힣]/.test(original)); }
function menuSections(restaurant, meal) { return (restaurant?.meals?.[meal]?.sections || []).filter(section => section.items?.length); }
function resolveSection(restaurant, meal, preferred) { const sections = menuSections(restaurant, meal); const hasFood = section => section.items.some(item => !isNotice(item)); return sections.find(section => section.name_ko === preferred) || sections.find(section => /^A(?:코너|창구|窗口)?$/i.test(section.name_ko.replace(/\s/g, '')) && hasFood(section)) || sections.find(hasFood) || sections[0]; }
function allDates(schedule) { return [...new Set(schedule.weeks.flatMap(week => week.dates))].sort(); }
function stepDate(schedule, date, direction) { const dates = [...new Set([...allDates(schedule), date].filter(Boolean))].sort(); const index = dates.indexOf(date); return dates[index + direction] || date; }
function calendarMonths(schedule, calendarWeek, menuWeek) {
  const week = schedule.weeks.find(item => item.key === calendarWeek) || schedule.weeks.find(item => item.key === menuWeek);
  return [...new Set((week?.dates || []).map(date => date.slice(0, 7)))];
}
function stepCalendarMonth(schedule, calendarWeek, menuWeek, month, direction) {
  const months = calendarMonths(schedule, calendarWeek, menuWeek);
  return months[months.indexOf(month) + direction] || month;
}
function storageRead(key) { try { return localStorage.getItem(key); } catch { return null; } }
function storageWrite(key, value) { try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ } }
let state, data, schedule, toastTimer;
let offlineFallback = false, offlineState = 'cachePending';
let lastContentKey = '', lastStripWeek = '', pendingDirection = 0;
const $ = id => document.getElementById(id);
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
const copy = () => COPY[state.lang];
const isChinese = () => state.lang === 'cn';
const activeWeek = () => schedule.weeks.find(week => week.key === state.week);
const currentRestaurant = () => activeWeek()?.days[state.date]?.restaurants?.find(restaurant => Number(restaurant.id) === state.restaurantId);
const restaurantInfo = () => RESTAURANTS.find(restaurant => restaurant.id === state.restaurantId) || RESTAURANTS[0];
const localized = (original, translated) => isChinese() && validTranslation(original, translated) ? translated : original || '';
const locale = () => isChinese() ? 'zh-CN' : 'ko-KR';
const currentSections = () => availableMeals(currentRestaurant()).includes(state.meal) ? menuSections(currentRestaurant(), state.meal) : [];

function icon(name) {
  const span = el('span');
  // Markup is limited to these static SVG paths. External menu text always uses textContent.
  span.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.bowl}</svg>`;
  return span.firstChild;
}
function dateText(date, options) { return date ? new Intl.DateTimeFormat(locale(), { timeZone: 'Asia/Seoul', ...options }).format(new Date(`${date}T12:00:00+09:00`)) : ''; }
function addDays(date, amount) { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + amount); return value.toISOString().slice(0, 10); }
function mondayOf(date) { const day = new Date(`${date}T12:00:00Z`).getUTCDay(); return addDays(date, -((day + 6) % 7)); }
function showStatus(id, text) { $(id).textContent = text || ''; $(id).hidden = !text; }
function haptic() { try { navigator.vibrate?.(8); } catch { /* optional */ } }

function closeSheet(dialog) {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { dialog.close(); return; }
  dialog.classList.add('is-closing');
  const finish = () => { dialog.classList.remove('is-closing'); dialog.close(); };
  dialog.addEventListener('animationend', finish, { once: true });
  setTimeout(() => { if (dialog.open) finish(); }, 400);
}
function openSheet(id) { for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close(); $(id).showModal(); }

function titleFor(date) {
  if (date === schedule.today) return copy().todayLabel;
  if (date === nextDate(schedule.today)) return copy().tomorrowLabel;
  return dateText(date, { weekday: 'long' });
}
function setSelection(changes, direction = 0) {
  Object.assign(state, changes);
  pendingDirection = direction;
  renderAll();
}
function fitMeal(restaurant, preferred) {
  const meals = availableMeals(restaurant);
  return meals.includes(preferred) || !meals.length ? preferred : meals[0];
}
function chooseDate(date, direction) {
  const week = schedule.weeks.find(item => item.dates.includes(date));
  if (!week || date === state.date) return;
  const restaurant = week.days[date]?.restaurants?.find(item => Number(item.id) === state.restaurantId);
  haptic();
  setSelection({ automatic: false, week: week.key, date, meal: fitMeal(restaurant, state.meal), sectionName: null }, direction ?? (date > state.date ? 1 : -1));
}
function chooseRestaurant(id) {
  if (id === state.restaurantId) return;
  haptic();
  storageWrite('menuRestaurant', String(id));
  state.restaurantId = id;
  if (state.automatic) { refreshAutomaticSelection(true); return; }
  setSelection({ meal: fitMeal(currentRestaurant(), state.meal), sectionName: null });
}
function chooseMeal(meal, direction = 0) {
  if (meal === state.meal) return;
  haptic();
  setSelection({ automatic: false, meal, sectionName: null }, direction || (MEAL_ORDER.indexOf(meal) > MEAL_ORDER.indexOf(state.meal) ? 1 : -1));
}

function refreshAutomaticSelection(force = false) {
  const now = new Date();
  const previousToday = schedule.today;
  schedule = buildSchedule(data, now);
  if (!state.automatic && !force) { if (previousToday !== schedule.today) renderAll(); else renderMenu(); return; }
  const selected = selectDefaultMenu(data, state.restaurantId, now);
  const changed = selected.date !== state.date || selected.meal !== state.meal || selected.week !== state.week || previousToday !== schedule.today;
  if (force) {
    state.automatic = true; state.linked = false;
    const url = new URL(window.location.href);
    for (const key of ['date', 'meal', 'window', 'restaurant']) url.searchParams.delete(key);
    window.history.replaceState(null, '', url);
  }
  if (changed || force) { Object.assign(state, selected); state.sectionName = null; renderAll(); }
  else renderMenu();
}

function renderWeekStrip() {
  const strip = $('weekStrip');
  const pages = schedule.weeks.map((week, index) => {
    const page = el('div', 'week-page');
    page.dataset.week = week.key;
    const label = el('p', 'week-label');
    label.append(el('span', '', week.key === 'next' ? copy().nextWeek : copy().thisWeek));
    if (index === 0 && schedule.weeks.length > 1) label.append(el('span', 'hint', copy().nextWeekHint));
    const grid = el('div', 'week-days');
    const start = mondayOf(week.dates[0]);
    for (let offset = 0; offset < 7; offset++) {
      const date = addDays(start, offset);
      const node = el('button', 'day-button');
      node.type = 'button';
      if (date === schedule.today) node.classList.add('is-today');
      if (offset >= 5) node.classList.add('is-weekend');
      node.disabled = !week.dates.includes(date);
      node.setAttribute('aria-pressed', String(date === state.date));
      node.setAttribute('aria-label', dateText(date, { month: 'long', day: 'numeric', weekday: 'long' }));
      node.append(el('span', 'day-name', copy().weekdays[offset]), el('span', 'day-number', String(Number(date.slice(8)))));
      node.addEventListener('click', () => chooseDate(date));
      grid.append(node);
    }
    page.append(label, grid);
    return page;
  });
  strip.replaceChildren(...pages);
  strip.setAttribute('aria-label', copy().calendar);
  const weekKey = schedule.weeks.find(week => week.dates.includes(state.date))?.key || state.week;
  if (weekKey !== lastStripWeek) {
    const target = pages.find(page => page.dataset.week === weekKey);
    const behavior = lastStripWeek ? 'smooth' : 'auto';
    lastStripWeek = weekKey;
    if (target) requestAnimationFrame(() => strip.scrollTo({ left: target.offsetLeft - pages[0].offsetLeft, behavior }));
  }
}

function segmented(container, options, selected, onChoose) {
  const index = options.findIndex(option => option.value === selected);
  container.style.setProperty('--count', options.length || 1);
  container.style.setProperty('--index', Math.max(0, index));
  container.classList.toggle('no-selection', index < 0);
  const existing = [...container.children];
  const reusable = existing.length === options.length && existing.every((node, i) => node.dataset.value === String(options[i].value));
  const nodes = reusable ? existing : options.map(option => {
    const node = el('button', 'segment');
    node.type = 'button'; node.setAttribute('role', 'tab'); node.dataset.value = String(option.value);
    node.addEventListener('click', () => onChoose(option.value));
    return node;
  });
  options.forEach((option, i) => { nodes[i].textContent = option.label; nodes[i].setAttribute('aria-selected', String(i === index)); });
  if (!reusable) container.replaceChildren(...nodes);
}

function renderSelectors() {
  segmented($('restaurantTabs'), RESTAURANTS.map(info => ({ value: info.id, label: isChinese() ? info.name_cn : info.name_ko })), state.restaurantId, value => chooseRestaurant(Number(value)));
  const meals = availableMeals(currentRestaurant());
  $('mealTabs').hidden = meals.length === 0;
  segmented($('mealTabs'), meals.map(meal => ({ value: meal, label: copy()[meal] })), state.meal, value => chooseMeal(value));
  $('restaurantTabs').setAttribute('aria-label', copy().restaurant);
  $('mealTabs').setAttribute('aria-label', copy().meal);
}

function cornerCard(section) {
  const card = el('article', 'corner-card');
  const food = section.items.filter(item => !isNotice(item));
  const notes = section.items.filter(isNotice);
  const name = localized(section.name_ko, section.name_cn);
  const header = el('h3', 'corner-name');
  const letter = /^([A-Z])\s*(?:코너|窗口)?$/i.exec(section.name_ko.trim());
  if (letter) header.append(el('span', 'corner-badge', letter[1].toUpperCase()));
  header.append(el('span', '', name));
  card.append(header);
  if (food.length) {
    card.append(el('p', 'main-dish', localized(food[0].ko, food[0].cn)));
    if (food.length > 1) {
      const list = el('ul', 'side-list');
      for (const item of food.slice(1)) list.append(el('li', '', localized(item.ko, item.cn)));
      card.append(list);
    }
  } else card.classList.add('note-card');
  if (notes.length) {
    const box = el('div', 'card-notes');
    box.append(...notes.map(item => el('p', '', localized(item.ko, item.cn))));
    card.append(box);
  }
  return card;
}

function renderMenu() {
  const restaurant = currentRestaurant();
  const closedDay = isClosedDay(restaurant, state.date);
  const unpublished = isUnpublishedDay(restaurant, state.date);
  const unavailable = unavailableMeal(restaurant, state.meal);
  const sections = closedDay ? [] : currentSections();
  const primary = closedDay ? undefined : resolveSection(restaurant, state.meal, null);
  const hasMenu = sections.length > 0;
  const info = restaurantInfo();

  const title = titleFor(state.date);
  $('pageTitle').textContent = title;
  const longDate = dateText(state.date, { month: 'long', day: 'numeric', weekday: 'long' });
  $('heroDate').textContent = title === dateText(state.date, { weekday: 'long' }) ? dateText(state.date, { month: 'long', day: 'numeric' }) : longDate;
  $('compactTitle').textContent = `${title} · ${copy()[state.meal] || ''}`;
  $('mealHeading').textContent = `${longDate} ${localized(info.name_ko, info.name_cn)} ${copy()[state.meal] || ''}`;

  const hours = serviceHours(restaurant, state.restaurantId)[state.meal];
  const fresh = dataFreshness(data) === 'fresh' && navigator.onLine && !offlineFallback;
  const status = serviceStatus(restaurant, state.restaurantId, state.date, state.meal, hasMenu ? primary : undefined, new Date(), fresh);
  $('serviceState').textContent = copy()[status];
  $('serviceState').dataset.state = status;
  $('serviceHours').textContent = hours ? `${hours.start} – ${hours.end}${hours.source === 'fallback' ? ` · ${copy().reference}` : ''}` : '';
  $('servicePlace').textContent = `${localized(info.name_ko, info.name_cn)} · ${isChinese() ? info.location_cn : info.location_ko}`;
  $('shareButton').disabled = !hasMenu;
  $('shareButton').setAttribute('aria-label', copy().share);
  $('shareButton').title = copy().share;

  const key = `${state.date}|${state.restaurantId}|${state.meal}|${state.lang}`;
  const list = $('menuList');
  list.replaceChildren(...sections.map(cornerCard));
  if (key !== lastContentKey) {
    list.classList.remove('is-entering', 'from-left', 'from-right');
    void list.offsetWidth;
    list.classList.add('is-entering');
    if (pendingDirection) list.classList.add(pendingDirection > 0 ? 'from-right' : 'from-left');
    const empty = $('emptyState');
    empty.style.animation = 'none'; void empty.offsetWidth; empty.style.animation = '';
    lastContentKey = key;
  }
  pendingDirection = 0;

  $('emptyState').hidden = hasMenu;
  document.querySelector('.meal-head').hidden = !hasMenu;
  $('emptyTitle').textContent = closedDay ? copy().holidayClosed : unpublished ? copy().notPublished : unavailable ? copy().unavailableMeal(copy()[state.meal]) : copy().empty;
  $('emptyDescription').textContent = closedDay ? copy().closedDescription : unpublished ? copy().notPublishedDescription : unavailable ? copy().unavailableDescription : copy().emptyDescription;

  let message = '';
  if (!restaurant && state.date) message = state.date > schedule.today ? copy().futureMissing : copy().missing;
  else if (restaurant?.fetch_status === 'error') message = copy().fetchError;
  else if (restaurant?.fetch_status === 'stale') message = restaurant.stale_reason === 'source_empty' ? copy().savedMenu : copy().staleRestaurant;
  else if (isChinese() && sections.some(section => !validTranslation(section.name_ko, section.name_cn) || section.items.some(item => !validTranslation(item.ko, item.cn)))) message = copy().translationMissing;
  showStatus('restaurantStatus', message);
  const freshness = dataFreshness(data);
  showStatus('dataStatus', freshness === 'missing' ? copy().noData : !navigator.onLine ? copy().offlineBanner : offlineFallback ? copy().cachedBanner : freshness !== 'fresh' ? copy().old : '');
  $('nowButton').hidden = state.automatic || !data;
}

function renderSettings() {
  const restaurant = currentRestaurant();
  const notes = isClosedDay(restaurant, state.date) ? [] : operatingNotices(restaurant);
  $('operatingSection').hidden = notes.length === 0;
  const info = restaurantInfo();
  $('operatingTitle').textContent = `${copy().operating} · ${localized(info.name_ko, info.name_cn)}`;
  $('operatingDetails').replaceChildren(...notes.map(item => el('p', '', localized(item.ko, item.cn))));
}

function renderText() {
  document.documentElement.lang = isChinese() ? 'zh-CN' : 'ko';
  document.title = `${copy().brand} · Ajou Menu`;
  const text = { brandSubtitle: 'brand', skipLink: 'skip', toolsTitle: 'tools', refreshLabel: 'refresh', sourceLabel: 'source', toolsDone: 'done', copyDone: 'done', copyTitle: 'share', copyHint: 'copyHint', disclaimer: 'disclaimer', footerNotice: 'footer', nowLabel: 'now' };
  for (const [id, name] of Object.entries(text)) $(id).textContent = copy()[name];
  if (!$('refreshStatus').hidden) showStatus('refreshStatus', copy().refreshOffline);
  $('languageLabel').textContent = isChinese() ? '한국어' : '中文';
  $('langToggle').setAttribute('aria-label', isChinese() ? '한국어로 전환' : '切换到中文');
  $('toolsToggle').setAttribute('aria-label', copy().tools);
  const generated = new Date(data?.generated_at);
  $('updatedAt').textContent = Number.isFinite(generated.getTime()) ? `${copy().updated} ${new Intl.DateTimeFormat(locale(), { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(generated)} KST` : '';
}

function renderAll() {
  state.sectionName = resolveSection(currentRestaurant(), state.meal, state.sectionName)?.name_ko || null;
  renderText(); renderWeekStrip(); renderSelectors(); renderMenu(); renderSettings();
  // Keep shared links aligned with subsequent choices, including a language change.
  if (state.linked) window.history.replaceState(null, '', menuLink());
}
function notify(text) { clearTimeout(toastTimer); showStatus('actionStatus', text); toastTimer = setTimeout(() => showStatus('actionStatus', ''), 2000); }

function menuLink() { const url = new URL(window.location.href); url.search = ''; url.hash = ''; for (const [name, value] of Object.entries({ date: state.date, restaurant: state.restaurantId, meal: state.meal, lang: state.lang })) if (value != null) url.searchParams.set(name, value); return url.href; }
async function copyMenu() {
  const sections = currentSections(); if (!sections.length) return;
  const info = restaurantInfo();
  const heading = `${copy().brand}\n${dateText(state.date, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}\n${localized(info.name_ko, info.name_cn)} · ${copy()[state.meal]}`;
  const body = sections.map(section => `【${localized(section.name_ko, section.name_cn)}】\n${section.items.map(item => localized(item.ko, item.cn)).join('\n')}`).join('\n\n');
  const text = `${heading}\n\n${body}`;
  try { await navigator.clipboard.writeText(text); haptic(); notify(copy().copied); }
  catch { $('copyText').value = text; openSheet('copyDialog'); $('copyText').focus(); $('copyText').select(); }
}

function stepMeal(direction) {
  const meals = availableMeals(currentRestaurant());
  const index = meals.indexOf(state.meal);
  const target = index < 0 ? meals[direction > 0 ? 0 : meals.length - 1] : meals[index + direction];
  if (target) { chooseMeal(target, direction); return; }
  const date = stepDate(schedule, state.date, direction);
  if (date === state.date) return;
  const week = schedule.weeks.find(item => item.dates.includes(date));
  const restaurant = week?.days[date]?.restaurants?.find(item => Number(item.id) === state.restaurantId);
  const nextMeals = availableMeals(restaurant);
  haptic();
  setSelection({ automatic: false, week: week.key, date, meal: nextMeals.length ? nextMeals[direction > 0 ? 0 : nextMeals.length - 1] : state.meal, sectionName: null }, direction);
}
function observeSwipes() {
  let start = null;
  const panel = $('mealPanel');
  panel.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { start = null; return; }
    const touch = event.touches[0];
    start = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, { passive: true });
  panel.addEventListener('touchend', event => {
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
    const quick = Date.now() - start.time < 700;
    start = null;
    if (quick && Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.6) stepMeal(dx < 0 ? 1 : -1);
  }, { passive: true });
}
function observeScroll() {
  let ticking = false;
  const update = () => {
    ticking = false;
    const threshold = $('pageTitle').getBoundingClientRect().bottom - $('topBar').getBoundingClientRect().bottom;
    $('topBar').classList.toggle('is-scrolled', threshold < 0);
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

function clearRetiredAppearance() {
  // The glass and custom-background settings were retired; free what they stored on this device.
  try { localStorage.removeItem('menuGlassStyle'); localStorage.removeItem('menuBackgroundStyle'); } catch { /* optional */ }
  try { indexedDB?.deleteDatabase('ajou-menu-background'); } catch { /* optional */ }
}

function init() {
  clearRetiredAppearance();
  data = typeof MENU_DATA === 'undefined' ? null : MENU_DATA;
  schedule = buildSchedule(data);
  const params = new URLSearchParams(window.location.search);
  const language = params.get('lang') || storageRead('menuLang');
  const savedRestaurant = Number(storageRead('menuRestaurant'));
  if (!params.has('restaurant') && RESTAURANTS.some(info => info.id === savedRestaurant)) params.set('restaurant', String(savedRestaurant));
  state = { ...initialSelection(data, params), lang: language === 'cn' ? 'cn' : 'ko' };
  for (const node of document.querySelectorAll('[data-icon]')) node.replaceChildren(icon(node.dataset.icon));
  $('langToggle').addEventListener('click', () => {
    state.lang = isChinese() ? 'ko' : 'cn';
    storageWrite('menuLang', state.lang);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', state.lang);
    window.history.replaceState(null, '', url);
    renderAll();
  });
  $('nowButton').addEventListener('click', () => { haptic(); refreshAutomaticSelection(true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('shareButton').addEventListener('click', copyMenu);
  $('toolsToggle').addEventListener('click', () => { renderSettings(); openSheet('toolsDialog'); });
  $('refreshButton').addEventListener('click', async () => {
    if (!navigator.onLine) { showStatus('refreshStatus', copy().refreshOffline); return; }
    showStatus('refreshStatus', '');
    $('refreshButton').disabled = true;
    $('refreshLabel').textContent = copy().refreshing;
    if (!state.automatic) window.history.replaceState(null, '', menuLink());
    let timeoutId;
    const updateWorker = (async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      await registration?.update();
    })().catch(() => {});
    await Promise.race([updateWorker, new Promise(resolve => { timeoutId = setTimeout(resolve, 2000); })]);
    clearTimeout(timeoutId);
    window.location.reload();
  });
  for (const event of ['online', 'offline']) window.addEventListener(event, () => {
    if (event === 'online') showStatus('refreshStatus', '');
    renderMenu();
  });
  for (const node of document.querySelectorAll('[data-close]')) node.addEventListener('click', () => closeSheet($(node.dataset.close)));
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) closeSheet(dialog); } });
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeSheet(dialog); });
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAutomaticSelection(); });
  setInterval(refreshAutomaticSelection, 30000);
  observeSwipes();
  renderAll();
  observeScroll();
  prepareOffline();
}

async function prepareOffline() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) { offlineState = 'cacheUnsupported'; return; }
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'menu-offline-fallback') { offlineFallback = true; renderMenu(); }
  });
  try {
    const registration = await navigator.serviceWorker.register('sw.js', { scope: './', updateViaCache: 'none' });
    const inspect = async () => {
      const reply = await new Promise(resolve => {
        const channel = new MessageChannel();
        const timer = setTimeout(() => { channel.port1.close(); resolve(null); }, 5000);
        channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
        registration.active?.postMessage({ type: 'menu-cache-status' }, [channel.port2]);
      });
      offlineState = reply?.ready ? 'cacheReady' : 'cacheFailed';
      if (reply?.fallback) { offlineFallback = true; renderMenu(); }
    };
    if (registration.active) await inspect();
    else navigator.serviceWorker.ready.then(inspect);
    navigator.serviceWorker.addEventListener('controllerchange', inspect);
  } catch { offlineState = 'cacheFailed'; }
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);
if (typeof module !== 'undefined' && module.exports) module.exports = { getKstDate, getKstMinutes, buildSchedule, isNotice, isClosedDay, isUnpublishedDay, availableMeals, unavailableMeal, operatingNotices, validTranslation, resolveSection, stepDate, calendarMonths, stepCalendarMonth, serviceHours, selectDefaultMenu, initialSelection, dataFreshness, serviceStatus };
