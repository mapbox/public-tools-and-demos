// vite.config sets `base` without a trailing slash, so BASE_URL needs
// normalising. Getting this wrong is quiet in dev: the SPA fallback answers an
// unknown path with index.html and a 200, so it surfaces as a JSON parse error
// rather than a 404.
export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
