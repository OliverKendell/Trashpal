/**
 * HomeScreen.js
 * Redesigned home screen with CO2 tracker, bin collection, and camera CTA.
 * Accepts `isFocused` prop from PagerView parent instead of useFocusEffect.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getSchedule, getScanHistory } from "../services/storageService";
import { getAllNextBinDays, getCountdownLabel } from "../utils/dateUtils";
import { BIN_TYPES, colors, fonts, spacing, radius, shadows } from "../constants/theme";

const CO2_PER_SCAN = 180; // grams saved per recyclable item scanned

export default function HomeScreen({ navigation, isFocused }) {
  const [schedule, setSchedule]   = useState(null);
  const [allBins, setAllBins]     = useState([]);
  const [co2Saved, setCo2Saved]   = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const saved = await getSchedule();
    setSchedule(saved);
    setAllBins(saved ? getAllNextBinDays(saved) : []);
    const history  = await getScanHistory();
    const recyclable = history.filter((s) => s.recyclable === true);
    setScanCount(recyclable.length);
    setCo2Saved(recyclable.length * CO2_PER_SCAN);
  };

  // Reload whenever this tab comes into view
  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  // Also load on first mount (isFocused may be true from the start)
  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const nextBin     = allBins[0] || null;
  const nextBinInfo = nextBin ? BIN_TYPES[nextBin.type] : null;

  const co2Display =
    co2Saved >= 1000
      ? `${(co2Saved / 1000).toFixed(1)} kg`
      : `${co2Saved} g`;

  const progressPct = Math.min((scanCount / 20) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.settingsCircle}
          onPress={() => navigation.navigate("Setup")}
        >
          <Image
            source={require("../assets/settingsicon.png")}
            style={styles.settingsIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
      >
        {/* ── CO2 Saved Tracker ── */}
        <View style={[styles.co2Card, shadows.md]}>
          <View style={styles.co2Top}>
            <Text style={styles.sectionLabel}>CO₂ Saved Tracker</Text>
            <Text style={styles.co2Emoji}>🌍</Text>
          </View>
          <View style={styles.co2Middle}>
            <Text style={styles.co2Amount}>{co2Display}</Text>
            <Text style={styles.co2Sub}>
              from {scanCount} recyclable item{scanCount !== 1 ? "s" : ""} scanned
            </Text>
          </View>
          <View style={styles.co2BarBg}>
            <View style={[styles.co2BarFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.co2BarLabel}>{scanCount}/20 items to next milestone</Text>
        </View>

        {/* ── Bin Collection ── */}
        <View style={[styles.binCard, shadows.md]}>
          <Text style={styles.binSectionLabel}>Bin Collection</Text>

          {nextBin && nextBinInfo ? (
            <>
              {/* Next bin hero row */}
              <View style={styles.binHeroRow}>
                <View style={[styles.binIconCircle, { backgroundColor: nextBinInfo.paleColor }]}>
                  <Text style={styles.binEmoji}>{nextBinInfo.emoji}</Text>
                </View>
                <View style={styles.binHeroInfo}>
                  <Text style={styles.binHeroName}>{nextBinInfo.label}</Text>
                  <Text style={styles.binHeroDay}>Every {nextBin.dayName}</Text>
                </View>
                <View style={[styles.countdownPill, { backgroundColor: nextBinInfo.paleColor }]}>
                  <Text style={[styles.countdownText, { color: nextBinInfo.color }]}>
                    {getCountdownLabel(nextBin.days)}
                  </Text>
                </View>
              </View>

              {/* Other upcoming bins */}
              {allBins.slice(1).map((bin) => {
                const info = BIN_TYPES[bin.type];
                return (
                  <View key={bin.type} style={styles.upcomingRow}>
                    <Text style={styles.upcomingEmoji}>{info.emoji}</Text>
                    <Text style={styles.upcomingName}>{info.label}</Text>
                    <Text style={[styles.upcomingDays, { color: info.color }]}>
                      {getCountdownLabel(bin.days)}
                    </Text>
                  </View>
                );
              })}
            </>
          ) : (
            <TouchableOpacity
              style={styles.noScheduleRow}
              onPress={() => navigation.navigate("Setup")}
              activeOpacity={0.7}
            >
              <Text style={styles.noScheduleEmoji}>📅</Text>
              <Text style={styles.noScheduleText}>Tap to set your collection days</Text>
              <Text style={styles.noScheduleArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Camera CTA ── */}
        <Text style={styles.cameraHint}>Not sure if it's recyclable?</Text>
        <TouchableOpacity
          style={[styles.cameraCard, shadows.md]}
          onPress={() => navigation.navigate("Camera")}
          activeOpacity={0.85}
        >
          <Text style={styles.cameraEmoji}>📷</Text>
          <Text style={styles.cameraText}>Check an item</Text>
          <Text style={styles.cameraArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLogo: {
    width: 150,
    height: 36,
  },
  settingsCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { width: 22, height: 22 },

  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  sectionLabel: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  // CO2 Card
  co2Card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  co2Top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  co2Emoji: { fontSize: 22 },
  co2Middle: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  co2Amount: {
    fontSize: fonts.sizes["2xl"],
    fontWeight: fonts.weights.heavy,
    color: colors.green,
  },
  co2Sub: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    flexShrink: 1,
  },
  co2BarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  co2BarFill: {
    height: "100%",
    backgroundColor: colors.green,
    borderRadius: radius.full,
  },
  co2BarLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
  },

  // Bin Card
  binSectionLabel: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  binCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 180,
    justifyContent: "center",
  },
  binHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  binIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  binEmoji: { fontSize: 36 },
  binHeroInfo: { flex: 1 },
  binHeroName: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  binHeroDay: {
    fontSize: fonts.sizes.base,
    color: colors.textMuted,
    marginTop: 4,
  },
  countdownPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  countdownText: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.bold,
  },
  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  upcomingEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  upcomingName: { flex: 1, fontSize: fonts.sizes.base, color: colors.textMuted },
  upcomingDays: { fontSize: fonts.sizes.base, fontWeight: fonts.weights.semibold },

  noScheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  noScheduleEmoji: { fontSize: 28 },
  noScheduleText: { flex: 1, fontSize: fonts.sizes.base, color: colors.textMuted },
  noScheduleArrow: { fontSize: 24, color: colors.textLight },

  // Camera CTA
  cameraHint: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    fontWeight: fonts.weights.medium,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  cameraCard: {
    backgroundColor: colors.greenPale,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.green + "55",
  },
  cameraEmoji: { fontSize: 32 },
  cameraText: {
    flex: 1,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.green,
  },
  cameraArrow: {
    fontSize: 28,
    color: colors.green,
    fontWeight: fonts.weights.bold,
  },
});
