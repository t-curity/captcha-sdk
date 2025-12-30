export class PhaseBSlotManager {
  private slots: Array<number | null>;

  constructor(slotCount: number) {
    this.slots = new Array(slotCount).fill(null);
  }

  /**
   * 특정 슬롯에 이미지 넣기
   */
  set(slotIndex: number, imageIndex: number | null) {
    this.slots[slotIndex] = imageIndex;
  }

  /**
   * 특정 슬롯 비우기
   */
  clear(slotIndex: number) {
    this.slots[slotIndex] = null;
  }

  /**
   * 특정 슬롯의 이미지 가져오기
   */
  get(slotIndex: number): number | null {
    return this.slots[slotIndex];
  }

  /**
   * 이미 이 이미지가 어떤 슬롯에 들어가 있는지 확인
   */
  findSlotByImage(imageIndex: number): number {
    return this.slots.indexOf(imageIndex);
  }

  /**
   * 모든 슬롯 데이터 반환
   */
  getAll(): Array<number | null> {
    return [...this.slots];
  }

  /**
   * 정답 제출용: null 제외한 인덱스들
   */
  getFilled(): number[] {
    return this.slots.filter((v): v is number => v !== null);
  }

  /**
   * 모든 슬롯이 찼는지 확인
   */
  isFull(max: number): boolean {
    return this.getFilled().length === max;
  }
}
