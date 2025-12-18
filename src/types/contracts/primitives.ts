export type ClientID = string;
export type SessionID = string;
export type ImageID = string;
export type Base64 = string;
export type Message = string;
export type TimeLimit = number;

// 0..1 정규화 좌표
export type NormalizedPoint = [
  x: number, // 0..1
  y: number, // 0..1
];
