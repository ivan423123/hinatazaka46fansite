class CacheService {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  getKey(key) {
    return `${this.prefix}_${key}`;
  }

  async get(key) {
    const data = localStorage.getItem(this.getKey(key));
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(this.getKey(key));
      return null;
    }
    return parsed.value;
  }

  set(key, value, ttl = 3600000) {
    const expiry = Date.now() + ttl;
    localStorage.setItem(
      this.getKey(key),
      JSON.stringify({
        value,
        expiry
      })
    );
  }
}