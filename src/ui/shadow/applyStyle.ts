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

  const supportsAdopted =
    "adoptedStyleSheets" in shadow &&
    Array.isArray((shadow as any).adoptedStyleSheets);

  if (supportsAdopted) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);

    (shadow as any).adoptedStyleSheets = [
      ...(shadow as any).adoptedStyleSheets,
      sheet,
    ];
  } else {
    // 🔹 Safari / iOS fallback
    const style = document.createElement("style");
    style.textContent = cssText;

    if (key) {
      style.setAttribute("data-style-key", key);
    }

    shadow.appendChild(style);
  }

  if (key) set.add(key);
}
