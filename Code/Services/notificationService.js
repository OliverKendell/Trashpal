/**
 * notificationService.js
 * Handles scheduling weekly bin reminder notifications via Expo Notifications
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { DAYS_MAP } from "../utils/dateUtils";

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bin-reminders", {
      name: "Bin Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1a7a4a",
    });
  }

  return status === "granted";
}

/**
 * Schedule a weekly repeating notification for a bin type.
 *
 * @param {string} dayName - e.g. "Monday"
 * @param {string} binType - e.g. "Recycling" | "General Waste" | "Garden Waste"
 * @param {string} emoji   - e.g. "♻️"
 * @returns {string|null} notification identifier, or null on failure
 */
export async function scheduleBinReminder(dayName, binType, emoji = "🗑️") {
  try {
    const weekday = DAYS_MAP[dayName]; // 0 = Sunday ... 6 = Saturday
    // Expo weekday trigger: 1 = Sunday, 2 = Monday ... 7 = Saturday
    const expoWeekday = weekday + 1;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} Bin day tomorrow!`,
        body: `Put your ${binType} bin out tonight — collection is tomorrow morning.`,
        sound: true,
        data: { binType, dayName },
      },
      trigger: {
        type: "weekly",
        weekday: expoWeekday,
        hour: 19, // 7pm the evening before
        minute: 0,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.error(`Failed to schedule reminder for ${binType}:`, error);
    return null;
  }
}

/**
 * Cancel all existing bin reminder notifications and reschedule from schedule object.
 *
 * @param {{ recycling?: string, general?: string, garden?: string }} schedule
 */
export async function rescheduleAllReminders(schedule) {
  // Cancel everything first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const granted = await requestNotificationPermissions();
  if (!granted) {
    console.warn("Notification permission not granted");
    return false;
  }

  const promises = [];

  if (schedule.recycling) {
    // The day BEFORE recycling collection
    const reminderDay = getPreviousDay(schedule.recycling);
    promises.push(scheduleBinReminder(reminderDay, "Recycling", "♻️"));
  }

  if (schedule.general) {
    const reminderDay = getPreviousDay(schedule.general);
    promises.push(scheduleBinReminder(reminderDay, "General Waste", "🗑️"));
  }

  if (schedule.garden) {
    const reminderDay = getPreviousDay(schedule.garden);
    promises.push(scheduleBinReminder(reminderDay, "Garden Waste", "🌿"));
  }

  await Promise.all(promises);
  return true;
}

/**
 * Cancel all TrashPal notifications
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the day name that is one day before the given day name
 */
function getPreviousDay(dayName) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const idx = days.indexOf(dayName);
  return days[(idx - 1 + 7) % 7];
}

/**
 * List all currently scheduled notifications (for debugging)
 */
export async function listScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications;
}
