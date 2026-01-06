import { RawPointerEvent } from "@/ui/input/raw";

export type Point = { x: number; y: number };

export class StrokeManager {
  private segments: RawPointerEvent[][] = [];
  private currentSegment: RawPointerEvent[] | null = null;
  public isPressed = false;

  /** 기록 시작 */
  public start(viewport_p: Point, img_p: Point, t: number = performance.now()) {
    this.isPressed = true;
    this.currentSegment = [];
    return this.record("down", viewport_p, img_p, t);
  }

  /** 이동 기록 */
  public move(
    viewport_p: Point,
    img_p: Point,
    event_type: RawPointerEvent["event_type"] = "move",
    t: number = performance.now(),
  ) {
    if (!this.isPressed || !this.currentSegment) return null;
    return this.record(event_type, viewport_p, img_p, t);
  }

  /** 기록 종료 (up 또는 cancel) */
  public stop(
    viewport_p: Point,
    img_p: Point,
    event_type: "up" | "cancel",
    t: number = performance.now(),
  ) {
    if (!this.isPressed || !this.currentSegment) return null;

    const lastPoint = this.record(event_type, viewport_p, img_p, t);
    this.segments.push([...this.currentSegment]);

    const result = {
      current: [...this.currentSegment],
      all: this.getFlattenedPoints(),
    };

    this.isPressed = false;

    return result;
  }

  private record(
    event_type: RawPointerEvent["event_type"],
    viewport_p: Point,
    img_p: Point,
    t: number,
  ) {
    const point: RawPointerEvent = { viewport_p, img_p, t, event_type };
    this.currentSegment?.push(point);
    return point;
  }

  public getCurrentSegment() {
    return this.currentSegment ? [...this.currentSegment] : [];
  }

  public getFirstPoint(): RawPointerEvent | null {
    return this.currentSegment?.[0] ?? null;
  }

  public getFlattenedPoints() {
    return this.segments.flat();
  }

  public clear() {
    this.segments = [];
    this.currentSegment = null;
    this.isPressed = false;
  }
}
