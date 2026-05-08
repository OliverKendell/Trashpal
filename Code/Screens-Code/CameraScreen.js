/**
 * CameraScreen.js
 * Opens device camera, captures image, sends to AI for waste classification
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { SafeAreaView } from "react-native-safe-area-context";

import { classifyWaste } from "../services/aiService";
import { saveScanResult } from "../services/storageService";
import { colors, fonts, spacing, radius } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState("off");
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const hasPermission = permission ? permission.granted : null;

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
      });

      // Resize to reduce API payload (max 512px wide)
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 512 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!resized.base64) {
        throw new Error("Failed to get base64 image data");
      }

      // Classify with AI
      const result = await classifyWaste(resized.base64);

      // Save to history
      await saveScanResult({
        ...result,
        imageUri: photo.uri,
      });

      // Navigate to Result — uses navigate() (not replace) so the parent
      // Stack can handle it; the tab state is preserved underneath.
      navigation.navigate("Result", { result, imageUri: photo.uri });
      setIsCapturing(false);
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert(
        "Classification Failed",
        error.message?.includes("API key")
          ? "Please add your OpenAI API key in aiService.js to use this feature."
          : "Couldn't classify this item. Please try again with better lighting.",
        [{ text: "Try Again", onPress: () => setIsCapturing(false) }]
      );
      setIsCapturing(false);
    }
  };

  // ── Permission denied ──────────────────────────────────────────────────────
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          TrashPal needs camera access to identify waste items. Please enable it
          in your device Settings.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Loading permissions ────────────────────────────────────────────────────
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.white} size="large" />
      </View>
    );
  }

  // ── Camera UI ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flashMode}
      />

      {/* Top Controls */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.topBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>Identify Item</Text>

        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => setFlashMode(flashMode === "off" ? "on" : "off")}
        >
          <Text style={styles.topBtnText}>{flashMode === "off" ? "⚡" : "⚡"}</Text>
          <Text style={styles.flashLabel}>{flashMode === "off" ? "Flash" : "On"}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Viewfinder guide */}
      {!isCapturing && (
        <View style={styles.viewfinderOverlay}>
          <View style={styles.viewfinderCorners}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
      )}

      {/* Analysing Overlay */}
      {isCapturing && (
        <View style={styles.analysingOverlay}>
          <View style={styles.analysingCard}>
            <ActivityIndicator color={colors.green} size="large" />
            <Text style={styles.analysingTitle}>Analysing item…</Text>
            <Text style={styles.analysingSubtitle}>
              Checking UK recycling guidelines
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      {!isCapturing && (
        <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.85}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </SafeAreaView>
      )}
    </View>
  );
}

const VIEWFINDER_SIZE = SCREEN_WIDTH * 0.65;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: radius.full,
  },
  topBtnText: {
    fontSize: 20,
    color: colors.white,
  },
  flashLabel: {
    fontSize: 9,
    color: colors.white,
    marginTop: -4,
  },
  topTitle: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },

  // Viewfinder
  viewfinderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinderCorners: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.white,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 4,
  },

  // Analysing overlay
  analysingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  analysingCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    width: "70%",
  },
  analysingTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  analysingSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },

  // Permission
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  permissionEmoji: { fontSize: 64, marginBottom: spacing.lg },
  permissionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  permissionText: {
    fontSize: fonts.sizes.base,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.green,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
    fontSize: fonts.sizes.base,
  },
});
