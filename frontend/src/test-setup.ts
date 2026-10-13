export class MockStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

if (typeof (globalThis as any).localStorage === "undefined") {
  (globalThis as any).localStorage = new MockStorage();
}

if (typeof (globalThis as any).sessionStorage === "undefined") {
  (globalThis as any).sessionStorage = new MockStorage();
}

if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = globalThis;
}

if (typeof (globalThis as any).history === "undefined") {
  (globalThis as any).history = {
    state: { idx: 0 },
    pushState: () => {},
    replaceState: () => {},
    go: () => {},
    back: () => {},
    forward: () => {},
  };
}

if (typeof (globalThis as any).location === "undefined") {
  (globalThis as any).location = {
    pathname: "/",
    search: "",
    hash: "",
    href: "http://localhost/",
    origin: "http://localhost",
  };
}

(globalThis as any).window.history = (globalThis as any).history;
(globalThis as any).window.location = (globalThis as any).location;

if (typeof (globalThis as any).document === "undefined") {
  (globalThis as any).document = {
    defaultView: globalThis,
    documentElement: {
      classList: {
        toggle: () => {},
        add: () => {},
        remove: () => {},
      },
    },
    getElementById: () => null,
    scrollTo: () => {},
  };
}
