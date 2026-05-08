/**
 * BinCard.js
 * Displays a single bin collection with countdown
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BIN_TYPES, colors, fonts, spacing, radius, shadows } from "../constants/theme";
import { getCountdownLabel } from "../utils/dateUtils";

export default function BinCard({ binData, isNext = false, style }) {
  if (!binData) return null;

  const binInfo = BIN_TYPES[binData.type] || BIN_TYPES.GENERAL;
  const countdown = getCountdownLabel(binData.days);
  const isUrgent = binData.days <= 1;

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: binInfo.color },
        isNext && styles.cardNext,
        isUrgent && styles.cardUrgent,
        shadows.md,
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: binInfo.paleColor }]}>
          <Text style={styles.iconEmoji}>{binInfo.emoji}</Text>
        </View>

        <View style={styles.info}>
          {isNext && (
            <Text style={[styles.nextLabel, { color: binInfo.color }]}>
              NEXT COLLECTION
            </Text>
          )}
          <Text style={styles.binName}>{binInfo.label}</Text>
          <Text style={styles.dayName}>{binData.dayName}</Text>
        </View>

        <View style={[styles.countdownPill, { backgroundColor: binInfo.paleColor }]}>
          <Text style={[styles.countdownText, { color: binInfo.color }]}>
            {countdown}
          </Text>
        </View>
      </View>

      {isNext && (
        <Text style={styles.description}>{binInfo.description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  cardNext: {
    paddingBottom: spacing.md,
  },
  cardUrgent: {
    borderLeftWidth: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  nextLabel: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  binName: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
  },
  dayName: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 1,
  },
  countdownPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  countdownText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
  },
  description: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginLeft: 44 + spacing.sm,
    lineHeight: 18,
  },
});
