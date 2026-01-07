import { PhaseBCellManager } from "./phaseBCellManager";
import { PhaseBDragUIManager } from "./phaseBDragUIManager";
import { PhaseBGhostManager } from "./phaseBGhostManager";
import { PhaseBSlotManager } from "./phaseBSlotManager";

export function createPhaseBAction(
  slotEls: HTMLElement[],
  slots: PhaseBSlotManager,
  cells: PhaseBCellManager,
  ghost: PhaseBGhostManager,
  verifyCompletion: () => void,
) {
  async function dropIntoSlot(slotIndex: number, imageIndex: number) {
    const prevImageIndex = slots.get(slotIndex);

    // 이미 같은 이미지가 들어가 있다면 무시
    if (prevImageIndex === imageIndex) return;

    // 새로운 이미지를 슬롯에 안착
    slots.set(slotIndex, imageIndex);

    renderSlots();

    // [밀어내기 로직] 슬롯에 이미 이미지가 있는 경우
    if (prevImageIndex !== null) {
      const prevCell = cells.getCell(prevImageIndex);
      const prevImg = cells.getCellImg(prevImageIndex);

      const nowCell = cells.getCell(imageIndex);

      if (nowCell) {
        nowCell.classList.add("is-used");
      }

      if (prevCell && prevImg) {
        // 슬롯에 있던 이미지를 그리드의 원래 칸으로 날려보냄
        await ghost.triggerFlight(
          slotEls[slotIndex].getBoundingClientRect(),
          prevCell.getBoundingClientRect(),
          prevImg,
          true,
        );
      }
    }

    renderSlots();
    renderGridUsage();
    verifyCompletion();
  }

  async function dropOutOfSlot(slotIndex: number) {
    console.log("dropOutOfSlot", slotIndex);
    const imageIndex = slots.get(slotIndex);
    if (imageIndex === null) return;

    const cell = cells.getCell(imageIndex);
    const img = cells.getCellImg(imageIndex);

    if (!cell || !img) return;

    slots.clear(slotIndex);

    renderSlots();
    ghost.remove();

    await ghost.triggerFlight(
      slotEls[slotIndex].getBoundingClientRect(),
      cell.getBoundingClientRect(),
      img,
      true,
    );

    renderSlots();
    renderGridUsage();
  }

  async function swapSlots(srcIdx: number, destIdx: number) {
    console.log("swapSlots", srcIdx, destIdx);
    const imgInSrcIndex = slots.get(srcIdx);
    const imgInDestIndex = slots.get(destIdx);

    if (imgInSrcIndex === null) return;

    slots.set(destIdx, imgInSrcIndex);
    slots.clear(srcIdx);

    renderSlots();

    if (imgInDestIndex === null) return;

    const img = cells.getCellImg(imgInDestIndex);

    if (img) {
      slots.set(srcIdx, imgInDestIndex);

      await ghost.triggerFlight(
        slotEls[destIdx].getBoundingClientRect(),
        slotEls[srcIdx].getBoundingClientRect(),
        img,
        false,
      );

      renderSlots();
    }
  }

  async function snapBack(
    imageIndex: number,
    flightTo: HTMLElement,
    isToGrid: boolean,
  ) {
    console.log("snapBack", imageIndex, flightTo, isToGrid);
    const ghostRect = ghost.getRect();
    const img = cells.getCellImg(imageIndex);

    if (!ghostRect || flightTo === null || !img) return;

    ghost.remove();

    await ghost.triggerFlight(
      ghostRect,
      flightTo.getBoundingClientRect(),
      img,
      isToGrid,
    );

    renderSlots();
    renderGridUsage();
  }

  function renderSlots() {
    console.log("renderSlots");
    slotEls.forEach((slot, i) => {
      const imgIdx = slots.get(i);

      if (imgIdx == null) {
        slot.querySelector("img")?.removeAttribute("src");
        slot.classList.remove("has-image");
      } else {
        const img = cells.getCellImg(imgIdx);

        if (img) {
          slot.querySelector("img")?.setAttribute("src", img.src);
          slot.classList.add("has-image");
        }
      }
    });
  }

  function renderGridUsage() {
    // 사용 중 상태 동기화 (슬롯에 있으면 사용 중)
    cells.getCells().forEach((cell) => {
      const imgIdx = Number(cell.dataset.index);

      cell.classList.toggle("is-used", slots.includes(imgIdx));
    });
  }

  return {
    dropIntoSlot,
    dropOutOfSlot,
    swapSlots,
    snapBack,
  };
}
