export class PhaseBCellManager {
  constructor(private gridEl: HTMLElement) {}

  getCells(): NodeListOf<HTMLElement> {
    return this.gridEl.querySelectorAll(".tc-cell");
  }

  getCell(imageIndex: number): HTMLElement | null {
    return this.gridEl.querySelector(`.tc-cell[data-index="${imageIndex}"]`);
  }

  getCellImg(imageIndex: number): HTMLImageElement | null {
    return this.gridEl.querySelector(
      `.tc-cell[data-index="${imageIndex}"] img`,
    );
  }
}
