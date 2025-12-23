const applied = new WeakMap<ShadowRoot, Set<string>>();

export function applyShadowStyle(
  shadow: ShadowRoot,
  cssText: string,
  key?: string,
) {
  let set = applied.get(shadow);
  if (!set) {
    set = new Set();
    applied.set(shadow, set);
  }

  if (key && set.has(key)) return;

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);

  shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];

  if (key) set.add(key);
}
