const applied = new WeakMap<
  ShadowRoot,
  Map<string, CSSStyleSheet | HTMLStyleElement>
>();

export function applyShadowStyle(
  shadow: ShadowRoot,
  cssText: string,
  key: string,
) {
  let stylesMap = applied.get(shadow);
  if (!stylesMap) {
    stylesMap = new Map();
    applied.set(shadow, stylesMap);
  }

  if (stylesMap.has(key)) return;

  const supportsAdopted =
    "adoptedStyleSheets" in shadow &&
    Array.isArray((shadow as any).adoptedStyleSheets);

  let styleInstance: CSSStyleSheet | HTMLStyleElement;

  if (supportsAdopted) {
    // 1. Modern 브라우저용 CSSStyleSheet 생성
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);

    (shadow as any).adoptedStyleSheets = [
      ...(shadow as any).adoptedStyleSheets,
      sheet,
    ];
    styleInstance = sheet;
  } else {
    // 2. Safari / iOS Fallback용 <style> 태그 생성
    const style = document.createElement("style");
    style.textContent = cssText;
    style.setAttribute("data-style-key", key);

    shadow.appendChild(style);
    styleInstance = style;
  }

  stylesMap.set(key, styleInstance);
}

export function removeShadowStyle(shadow: ShadowRoot, key: string) {
  const stylesMap = applied.get(shadow);
  if (!stylesMap || !stylesMap.has(key)) return;

  const styleInstance = stylesMap.get(key)!;

  // 1. Modern 브라우저 (adoptedStyleSheets)에서 제거
  if (styleInstance instanceof CSSStyleSheet) {
    (shadow as any).adoptedStyleSheets = (
      shadow as any
    ).adoptedStyleSheets.filter((sheet: any) => sheet !== styleInstance);
  }
  // 2. Safari / iOS Fallback (<style> 태그) 제거
  else {
    styleInstance.remove();
  }

  stylesMap.delete(key);

  if (stylesMap.size === 0) {
    applied.delete(shadow);
  }
}
