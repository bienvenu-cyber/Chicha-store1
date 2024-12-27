export default function networkOptimization(req, res, next) {
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Response-Time', Date.now());
  next();
}
