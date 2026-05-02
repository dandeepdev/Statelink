const s = new Set(["a", "b"]);
const p = new Proxy(s, {
  get(obj, prop, receiver) {
    if (prop === 'size') {
      return Reflect.get(obj, prop, obj);
    }
    const value = Reflect.get(obj, prop, obj);
    if (typeof value !== 'function') return value;
    if (prop === 'constructor') return value;

    if (prop === 'values' || prop === 'keys' || prop === Symbol.iterator) {
      return function() {
        const it = obj.values();
        return {
          next: () => {
            const res = it.next();
            if (!res.done) res.value = res.value; // fake proxy
            return res;
          },
          [Symbol.iterator]() { return this; }
        };
      };
    }
    return value.bind(obj);
  }
});
console.log("Size:", p.size);
console.log("Array.from:", Array.from(p));
