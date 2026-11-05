/* مواقيت الصلاة (حساب فلكي على الجهاز، من غير إنترنت)
   المدينة: القاهرة — الطريقة: الهيئة المصرية العامة للمساحة — الفجر ١٩٫٥° — العصر على المذهب الشافعي (الجمهور) */
(() => {
  // المواقيت محسوبة على مدينة القاهرة
  const CITY = ['cairo', 'القاهرة', 30.0444, 31.2357, 19.5, 17.5];

  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  function sunPos(jd) {
    const D = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360);
    const q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = fix(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15, 24);
    return { decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt: q / 15 - RA };
  }

  // كل الأوقات بالساعات العشرية بالتوقيت المحلي للجهاز
  function compute(date, lat, lng, fajrAngle, ishaAngle = 17.5) {
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const tz = -new Date(y, m - 1, d, 12).getTimezoneOffset() / 60;
    let Y = y, M = m; if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 - lng / 360;
    const midDay = (t) => fix(12 - sunPos(jd + t).eqt, 24);
    const angleT = (angle, t, ccw) => {
      const { decl } = sunPos(jd + t);
      const v = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat)));
      const h = deg(Math.acos(Math.max(-1, Math.min(1, v)))) / 15;
      return midDay(t) + (ccw ? -h : h);
    };
    const asrT = (t) => {
      const { decl } = sunPos(jd + t);
      const angle = -deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - decl))))));
      return angleT(angle, t, false);
    };
    // تقريب أولي ثم تحسين
    let tt = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 19.5 };
    for (let k = 0; k < 2; k++) {
      const f = (h) => h / 24;
      tt = {
        fajr: angleT(fajrAngle, f(tt.fajr), true),
        sunrise: angleT(0.833, f(tt.sunrise), true),
        dhuhr: midDay(f(tt.dhuhr)),
        asr: asrT(f(tt.asr)),
        maghrib: angleT(0.833, f(tt.maghrib), false),
        isha: angleT(ishaAngle, f(tt.isha), false),
      };
    }
    const adj = (h) => h + tz - lng / 15;
    const out = {};
    for (const k in tt) out[k] = adj(tt[k]);
    return out;
  }

  const toDate = (base, h) => { const x = new Date(base); x.setHours(0, 0, 0, 0); return new Date(x.getTime() + Math.round(h * 60) * 60000); };
  const AR = (n) => Number(n).toLocaleString('ar-EG');
  const fmt = (dt) => {
    let h = dt.getHours(); const m = dt.getMinutes(); const pm = h >= 12;
    h = h % 12 || 12;
    return `${AR(h)}:${AR(String(m).padStart(2, '0')).padStart(2, '٠')}\u00A0${pm ? 'م' : 'ص'}`;
  };

  const getCity = () => CITY;

  window.PrayerTimes = {
    city: () => ({ id: CITY[0], name: CITY[1] }),
    today(now = new Date()) {
      const c = getCity();
      const h = compute(now, c[2], c[3], c[4], c[5]);
      const r = {};
      for (const k in h) r[k] = toDate(now, h[k]);
      return r;
    },
    fmt,
    _compute: compute,
  };
})();
