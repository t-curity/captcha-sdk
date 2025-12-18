export class UserCancelledError extends Error {
  code = "USER_CANCELLED" as const;
  constructor() {
    super("USER_CANCELLED");
  }
}
