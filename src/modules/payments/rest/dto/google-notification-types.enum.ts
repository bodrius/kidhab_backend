export enum GoogleNotificationTypes {
  SUBSCRIPTION_RECOVERED = 1, // -> should move family back to PREMIUM if everything ok
  SUBSCRIPTION_RENEWED = 2, // -> should move family back to PREMIUM if everything ok
  SUBSCRIPTION_CANCELED = 3, // -> throw to basic
  SUBSCRIPTION_RESTARTED = 7, // -> move to PREMIUM
  SUBSCRIPTION_DEFERRED = 9, // -> update subscription
  SUBSCRIPTION_PAUSED = 10, // -> update subscription
  SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED = 11, // -> update subscription
  SUBSCRIPTION_REVOKED = 12,
  SUBSCRIPTION_EXPIRED = 13,
}
