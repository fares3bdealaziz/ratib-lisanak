// خريطة الموقع (sitemap.xml) وملف robots.txt لجوجل
// بيتعملوا من اسم الموقع نفسه، فبيشتغلوا أيًا كان اللينك (vercel.app أو دومين خاص)
module.exports = (req, res) => {
  const h = (req.headers || {});
  const host = String(h['x-forwarded-host'] || h.host || '').split(',')[0].trim().replace(/[^a-zA-Z0-9.\-:]/g, '');
  const base = `https://${host}`;
  let f = '';
  try { f = (req.query && req.query.f) || new URL(req.url, 'http://x').searchParams.get('f') || ''; } catch { /* تجاهل */ }
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  if (f === 'robots') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`);
  }
  const today = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`);
};
