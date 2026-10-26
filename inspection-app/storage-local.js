// Stand-in for claude.ai's window.storage, kept in this browser's localStorage.
// Shared and personal keys are stored apart, as they are in claude.ai.
(() => {
  const k = (key, shared) => `irapp:${shared ? "shared" : "personal"}:${key}`;
  const ls = () => { try { return window.localStorage; } catch { return null; } };
  window.storage = {
    async get(key, shared = false) {
      const s = ls(), value = s && s.getItem(k(key, shared));
      return value == null ? null : { key, value, shared };
    },
    async set(key, value, shared = false) {
      const s = ls();
      if (!s) throw new Error("Browser storage is not available");
      s.setItem(k(key, shared), value);
      return { key, value, shared };
    },
    async delete(key, shared = false) {
      const s = ls();
      if (s) s.removeItem(k(key, shared));
      return { key, deleted: true, shared };
    },
    async list(prefix = "", shared = false) {
      const s = ls(), p = k(prefix, shared), keys = [];
      if (s) for (let i = 0; i < s.length; i++) {
        const name = s.key(i);
        if (name.startsWith(p)) keys.push(name.slice(k("", shared).length));
      }
      return { keys, prefix, shared };
    },
  };
})();
