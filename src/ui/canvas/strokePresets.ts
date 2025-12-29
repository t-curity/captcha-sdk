import { THEME } from "@/ui/theme";
import { StrokePresetName, StrokeOptions } from "./types";

export const STROKE_PRESET: Record<StrokePresetName, StrokeOptions> = {
  normal: {
    color: THEME.color.primary,
    lineWidth: THEME.draw.width,
    shadowColor: THEME.draw.glowColor,
    shadowBlur: THEME.draw.glowBlur,
  },
  pass: {
    color: THEME.color.pass,
    lineWidth: THEME.draw.width,
    shadowColor: THEME.draw.passGlowColor,
    shadowBlur: THEME.draw.passGlowBlur,
  },
  fail: {
    color: THEME.color.fail,
    lineWidth: THEME.draw.width,
    shadowColor: THEME.draw.failGlowColor,
    shadowBlur: THEME.draw.failGlowBlur,
  },
} as const;
