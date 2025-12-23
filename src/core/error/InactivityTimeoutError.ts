export class InactivityTimeoutError extends Error {
  code = "INACTIVITY_TIMEOUT" as const;
  constructor() {
    super("INACTIVITY_TIMEOUT");
  }
}
