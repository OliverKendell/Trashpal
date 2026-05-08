/**
 * ResultScreen.js
 * Displays the AI waste classification result
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BIN_TYPES, colors, fonts, spacing, radius, shadows } from "../constants/theme";
import Button from "../components/Button";

export default function ResultScreen({ navigation, route }) {
  const { result, imageUri } = route.params || {};

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No result found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const { item, recyclable, explanation, bin } = result;

  // Pick display config
  const isRecyclable = recyclable === true;
  const binKey = bin === "Recycling"
    ? "RECYCLING"
    : bin === "Garden Waste"
    ? "GARDEN"
    : "GENERAL";
  const binInfo = BIN_TYPES[binKey];

  const statusColor     = isRecyclable ? colors.success    : colors.danger;
  const statusPaleColor = isRecyclable ? colors.successPale : colors.dangerPale;
  const statusEmoji     = isRecyclable ? "✅" : "❌";
  const statusLabel     = isRecyclable ? "Recyclable" : "Not Recyclable";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `TrashPal says: "${item}" is ${isRecyclable ? "♻️ recyclable" : "🗑️ not recyclable"} in the UK.\n\n${explanation}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Nav */}
      <View style={styles.navbar}>
        <TouchableOpacity
          // goBack() pops Result off the Stack, revealing the Camera tab beneath
          onPress={() => navigation.goBack()}
          style={styles.navBackBtn}
        >
          <Text style={styles.navBackText}>‹ Scan Again</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareIcon}>⬆</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>

        {/* Status Hero */}
        <View style={[styles.statusHero, { backgroundColor: statusPaleColor }]}>
          <Text style={styles.statusEmoji}>{statusEmoji}</Text>
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </Text>
          <Text style={styles.itemName}>{item}</Text>
        </View>

        {/* Captured Image */}
        {imageUri && (
          <View style={[styles.imageCard, shadows.md]}>
            <Image
              source={{ uri: imageUri }}
              style={styles.capturedImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Which bin */}
        <View style={[styles.binCard, { backgroundColor: binInfo.paleColor }, shadows.sm]}>
          <View style={[styles.binIconCircle, { backgroundColor: binInfo.color + "22" }]}>
            <Text style={styles.binEmoji}>{binInfo.emoji}</Text>
          </View>
          <View style={styles.binInfo}>
            <Text style={[styles.binLabel, { color: binInfo.color }]}>PUT IN</Text>
            <Text style={styles.binName}>{binInfo.label}</Text>
          </View>
        </View>

        {/* Explanation */}
        <View style={[styles.explanationCard, shadows.sm]}>
          <Text style={styles.explanationTitle}>Why?</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>

        {/* UK Recycling note */}
        <View style={styles.ukNote}>
          <Text style={styles.ukNoteText}>
            ℹ️  Recycling rules vary by UK council. When in doubt, check your
            local council's website for the most accurate guidance.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Scan Another Item"
            icon="📷"
            size="lg"
            // goBack() returns to Camera tab (already mounted, no reload)
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
          />
          <Button
            title="Back to Home"
            variant="secondary"
            size="lg"
            // Navigate to the Home tab inside MainTabs
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "Home" })
            }
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },

  // Navbar
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
  navBackBtn: { width: 80, paddingVertical: spacing.xs },
  navBackText: {
    fontSize: fonts.sizes.base,
    color: colors.green,
    fontWeight: fonts.weights.medium,
  },
  navTitle: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
  },
  shareBtn: {
    width: 80,
    alignItems: "flex-end",
    paddingVertical: spacing.xs,
  },
  shareIcon: {
    fontSize: 20,
  },

  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Status hero
  statusHero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statusEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: fonts.sizes["2xl"],
    fontWeight: fonts.weights.heavy,
    color: colors.text,
    textAlign: "center",
  },

  // Image
  imageCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  capturedImage: {
    width: "100%",
    height: 200,
  },

  // Bin
  binCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  binIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  binEmoji: { fontSize: 26 },
  binInfo: { flex: 1 },
  binLabel: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  binName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },

  // Explanation
  explanationCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  explanationTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  explanationText: {
    fontSize: fonts.sizes.base,
    color: colors.text,
    lineHeight: 22,
  },

  // UK note
  ukNote: {
    backgroundColor: colors.greenPale,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  ukNoteText: {
    fontSize: fonts.sizes.xs,
    color: colors.green,
    lineHeight: 17,
  },

  // Actions
  actions: {
    gap: spacing.sm,
  },
  actionBtn: {},

  errorText: {
    fontSize: fonts.sizes.lg,
    color: colors.textMuted,
    textAlign: "center",
    margin: spacing.xl,
  },
});
