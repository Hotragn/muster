// The household's bottles live only in this browser's localStorage.
// Every access is guarded: private windows and blocked storage must not break the page.
const KEY = 'muster.v1';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.meds) || !data.settings) return null;
    return data;
  } catch {
    return null;
  }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep working in memory */ }
}

export function clear() {
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}
