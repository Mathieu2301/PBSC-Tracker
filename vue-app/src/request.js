export default async function $(path, cache = '') {
  if (!cache) return fetch(`https://${window.config.server}/${path}`).then((rs) => rs.json());

  let cacheValue = localStorage.getItem(cache);
  if (cacheValue) {
    try {
      cacheValue = JSON.parse(cacheValue);
    } catch (error) {
      localStorage.removeItem(cache);
      cacheValue = null;
    }
  }

  const lastFetch = localStorage.getItem(`${cache}_lastFetch`);
  if (!cacheValue || lastFetch !== new Date().toLocaleDateString()) {
    cacheValue = await fetch(`https://${window.config.server}/${path}`).then((rs) => rs.json());
    localStorage.setItem(cache, JSON.stringify(cacheValue));
    localStorage.setItem(`${cache}_lastFetch`, new Date().toLocaleDateString());
  }

  return cacheValue;
}
