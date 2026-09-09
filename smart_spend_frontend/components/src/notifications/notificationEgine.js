import { generateNotification } from "./notificationRules";

export function getDailyNotification(data) {
  return generateNotification(data);
}
