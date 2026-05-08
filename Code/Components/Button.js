/**
 * Button.js
 * Reusable button component
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { colors, fonts, radius, spacing } from "../constants/theme";

export default function Button({
  title,
  onPress,
  variant = "primary", // "primary" | "secondary" | "ghost" | "danger"
  size = "md",         // "sm" | "md" | "lg"
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.white : colors.green}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    fontSize: 16,
  },

  // Variants
  primary: {
    backgroundColor: colors.green,
  },
  secondary: {
    backgroundColor: colors.greenPale,
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  size_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
  },
  size_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },

  // Label styles
  label: {
    fontWeight: fonts.weights.semibold,
  },
  label_primary: { color: colors.white },
  label_secondary: { color: colors.green },
  label_ghost: { color: colors.text },
  label_danger: { color: colors.white },

  labelSize_sm: { fontSize: fonts.sizes.sm },
  labelSize_md: { fontSize: fonts.sizes.base },
  labelSize_lg: { fontSize: fonts.sizes.lg },

  disabled: {
    opacity: 0.45,
  },
});
