/**
 * storageService.js
 * Handles all local persistence via AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  SCHEDULE: "trashpal_schedule",
  SCAN_HISTORY: "trashpal_scan_history",
  ONBOARDED: "trashpal_onboarded",
};

// ─── Schedule ────────────────────────────────────────────────────────────────

/**
 * Save bin collection schedule
 * @param {{ recycling: string, general: string, garden?: string }} schedule
 */
export async function saveSchedule(schedule) {
  try {
    await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
    return true;
  } catch (error) {
    console.error("Failed to save schedule:", error);
    return false;
  }
}

/**
 * Retrieve saved schedule, or null if not set
 */
export async function getSchedule() {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get schedule:", error);
    return null;
  }
}

/**
 * Remove saved schedule
 */
export async function clearSchedule() {
  try {
    await AsyncStorage.removeItem(KEYS.SCHEDULE);
    return true;
  } catch (error) {
    console.error("Failed to clear schedule:", error);
    return false;
  }
}

// ─── Scan History ─────────────────────────────────────────────────────────────

/**
 * Save a new scan result to history (max 50 items)
 * @param {{ item: string, recyclable: boolean, explanation: string, imageUri?: string }} scan
 */
export async function saveScanResult(scan) {
  try {
    const existing = await getScanHistory();
    const newEntry = {
      ...scan,
      id: Date.now().toString(),
      scannedAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing].slice(0, 50); // keep last 50
    await AsyncStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(updated));
    return newEntry;
  } catch (error) {
    console.error("Failed to save scan result:", error);
    return null;
  }
}

/**
 * Get all saved scan results
 */
export async function getScanHistory() {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCAN_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get scan history:", error);
    return [];
  }
}

/**
 * Clear all scan history
 */
export async function clearScanHistory() {
  try {
    await AsyncStorage.removeItem(KEYS.SCAN_HISTORY);
    return true;
  } catch (error) {
    console.error("Failed to clear scan history:", error);
    return false;
  }
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function setOnboarded() {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDED, "true");
  } catch (error) {
    console.error("Failed to set onboarded:", error);
  }
}

export async function hasOnboarded() {
  try {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return val === "true";
  } catch {
    return false;
  }
}
