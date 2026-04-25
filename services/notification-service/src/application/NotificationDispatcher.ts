export type NotificationPayload = {
  userId: string;
  role: "inspector" | "supervisor" | "admin";
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
};

export class NotificationDispatcher {
  async dispatch(payload: NotificationPayload) {
    return {
      notificationId: `notif-${Date.now()}`,
      channel: "fcm",
      status: "queued",
      ...payload,
    };
  }
}

