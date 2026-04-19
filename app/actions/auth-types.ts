/** 클라이언트 전용 import용 — 서버 액션 파일과 분리해 번들이 타입만 참조하도록 합니다. */

export type AuthActionState =
  | { success: false; error: string }
  | { success: true; pendingVerification: true; email: string };
