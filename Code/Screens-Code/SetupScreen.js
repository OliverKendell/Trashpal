/**
 * SetupScreen.js
 * Allows user to configure their bin collection days
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { saveSchedule, getSchedule, clearSchedule } from "../services/storageService";
import { rescheduleAllReminders, requestNotificationPermissions } from "../services/notificationService";
import { DAYS_OF_WEEK, colors, fonts, spacing, radius, shadows } from "../constants/theme";
import Button from "../components/Button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SetupScreen({ navigation }) {
  const [recycling, setRecycling] = useState(null);
  const [general, setGeneral] = useState(null);
  const [garden, setGarden] = useState(null);
  const [hasGarden, setHasGarden] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Pre-populate from existing schedule
    (async () => {
      const saved = await getSchedule();
      if (saved) {
        setRecycling(saved.recycling || null);
        setGeneral(saved.general || null);
        setGarden(saved.garden || null);
        setHasGarden(!!saved.garden);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!recycling || !general) {
      Alert.alert(
        "Missing Days",
        "Please select both your recycling day and general waste day to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    setSaving(true);
    try {
      const schedule = {
        recycling,
        general,
        ...(hasGarden && garden ? { garden } : {}),
      };

      await saveSchedule(schedule);

      // Request permissions and schedule notifications
      const granted = await requestNotificationPermissions();
      if (granted) {
        await rescheduleAllReminders(schedule);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save schedule. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Clear Schedule",
      "This will remove your bin schedule and cancel all reminders. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearSchedule();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Nav Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Bin Schedule</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Tell TrashPal which days your bins are collected. You'll get a reminder
          the evening before each collection.
        </Text>

        {/* Recycling */}
        <DayPicker
          label="Recycling Day"
          emoji="♻️"
          color={colors.recyclingBlue}
          paleColor={colors.recyclingBluePale}
          selected={recycling}
          onSelect={setRecycling}
          description="Blue bin — paper, cardboard, glass, cans, plastics"
        />

        {/* General Waste */}
        <DayPicker
          label="General Waste Day"
          emoji="🗑️"
          color={colors.generalGrey}
          paleColor={colors.generalGreyPale}
          selected={general}
          onSelect={setGeneral}
          description="Black bin — non-recyclable household waste"
        />

        {/* Garden Waste Toggle */}
        <TouchableOpacity
          style={[styles.gardenToggle, hasGarden && styles.gardenToggleActive]}
          onPress={() => {
            setHasGarden(!hasGarden);
            if (hasGarden) setGarden(null);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.gardenEmoji}>🌿</Text>
          <Text style={[styles.gardenToggleText, hasGarden && styles.gardenToggleTextActive]}>
            {hasGarden ? "Garden waste — tap to remove" : "Add garden waste collection"}
          </Text>
          <Text style={styles.gardenToggleIcon}>{hasGarden ? "✕" : "+"}</Text>
        </TouchableOpacity>

        {hasGarden && (
          <DayPicker
            label="Garden Waste Day"
            emoji="🌿"
            color={colors.gardenBrown}
            paleColor={colors.gardenBrownPale}
            selected={garden}
            onSelect={setGarden}
            description="Brown bin — grass, leaves, plants, small branches"
          />
        )}

        {/* Save */}
        <Button
          title="Save Schedule"
          size="lg"
          onPress={handleSave}
          loading={saving}
          disabled={!recycling || !general}
          style={styles.saveBtn}
        />

        {/* Clear */}
        <Button
          title="Clear Schedule"
          variant="ghost"
          onPress={handleClear}
          style={styles.clearBtn}
        />

        <Text style={styles.footerNote}>
          🔔 Reminders fire at 7pm the evening before your collection day.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── DayPicker sub-component ───────────────────────────────────────────────────

function DayPicker({ label, emoji, color, paleColor, selected, onSelect, description }) {
  return (
    <View style={styles.pickerBlock}>
      <View style={styles.pickerHeader}>
        <Text style={styles.pickerEmoji}>{emoji}</Text>
        <View>
          <Text style={styles.pickerLabel}>{label}</Text>
          <Text style={styles.pickerDescription}>{description}</Text>
        </View>
      </View>

      <View style={styles.daysGrid}>
        {DAYS.map((day) => {
          const isSelected = selected === day;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayChip,
                isSelected && { backgroundColor: color, borderColor: color },
                !isSelected && { borderColor: colors.border },
              ]}
              onPress={() => onSelect(day)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dayChipText,
                  isSelected && styles.dayChipTextSelected,
                ]}
              >
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <Text style={[styles.selectedConfirm, { color }]}>
          ✓ Every {selected}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    width: 60,
  },
  backText: {
    fontSize: fonts.sizes.base,
    color: colors.green,
    fontWeight: fonts.weights.medium,
  },
  navTitle: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
    backgroundColor: colors.greenPale,
    padding: spacing.md,
    borderRadius: radius.md,
  },

  // Picker
  pickerBlock: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pickerEmoji: {
    fontSize: 24,
    marginTop: 1,
  },
  pickerLabel: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
  },
  pickerDescription: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  dayChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    backgroundColor: colors.white,
  },
  dayChipText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.textMuted,
  },
  dayChipTextSelected: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  selectedConfirm: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    marginTop: spacing.sm,
  },

  // Garden toggle
  gardenToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  gardenToggleActive: {
    borderColor: colors.gardenBrown,
    borderStyle: "solid",
    backgroundColor: colors.gardenBrownPale,
  },
  gardenEmoji: {
    fontSize: 20,
  },
  gardenToggleText: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    fontWeight: fonts.weights.medium,
  },
  gardenToggleTextActive: {
    color: colors.gardenBrown,
  },
  gardenToggleIcon: {
    fontSize: fonts.sizes.lg,
    color: colors.textLight,
    fontWeight: fonts.weights.bold,
  },

  saveBtn: {
    marginTop: spacing.md,
  },
  clearBtn: {
    marginTop: spacing.sm,
  },
  footerNote: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 17,
  },
});
