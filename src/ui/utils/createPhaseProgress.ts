export function createPhaseProgress(fills: HTMLDivElement[]) {
  const root = document.createElement("div");

  function setPhasePercent(percents: number[]) {
    for (const [i, percent] of percents.entries()) {
      const p = Math.max(0, Math.min(100, percent));
      fills[i].style.width = `${p}%`;
    }
  }

  return { root, setPhasePercent };
}
