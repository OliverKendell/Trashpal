/**
 * App.js — PagerView edition
 * SetupScreen | HomeScreen | CameraScreen all mounted simultaneously.
 * Uses react-native-pager-view directly — no material-top-tabs needed.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PagerView from "react-native-pager-view";
import * as Notifications from "expo-notifications";

import HomeScreen   from "./screens/HomeScreen";
import SetupScreen  from "./screens/SetupScreen";
import CameraScreen from "./screens/CameraScreen";
import ResultScreen from "./screens/ResultScreen";
import { colors, fonts, spacing, radius, shadows } from "./constants/theme";

const Stack = createNativeStackNavigator();

// Order: Setup=0, Home=1, Camera=2
const TABS = [
  { name: "Setup",  emoji: "📅" },
  { name: "Home",   emoji: "🏠" },
  { name: "Camera", emoji: "📷" },
];
const TAB_COLOR = "#16a34a";

// ── Custom bottom tab bar ──────────────────────────────────────────────────────
function CustomTabBar({ activeIndex, onPress }) {
  return (
    <View style={tabStyles.container}>
      {TABS.map((tab, index) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tab}
            onPress={() => onPress(index)}
            activeOpacity={0.7}
          >
            <View style={[
              tabStyles.indicator,
              { backgroundColor: isActive ? TAB_COLOR : "transparent" },
            ]} />
            <Text style={[tabStyles.emoji, { opacity: isActive ? 1 : 0.4 }]}>
              {tab.emoji}
            </Text>
            <Text style={[
              tabStyles.label,
              { color: isActive ? TAB_COLOR : colors.textLight },
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Paged container for the three main screens ─────────────────────────────────
function MainTabs({ navigation }) {
  const pagerRef    = useRef(null);
  const [activeIndex, setActiveIndex] = useState(1); // start on Home (index 1)
  // Keep a ref so makeNav closures always read the latest value
  const activeIndexRef = useRef(1);

  const handlePageSelected = useCallback((e) => {
    const index = e.nativeEvent.position;
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  const goToPage = useCallback((index) => {
    pagerRef.current?.setPage(index);
  }, []);

  // Lightweight fake navigation passed to each screen so their calls work
  const makeNav = (pageIndex) => ({
    navigate: (screen, params) => {
      if (screen === "Setup")        goToPage(0);
      else if (screen === "Home")    goToPage(1);
      else if (screen === "Camera")  goToPage(2);
      else if (screen === "Result")  navigation.navigate("Result", params);
      else if (screen === "MainTabs") {
        const target = params?.screen;
        if (target === "Setup")       goToPage(0);
        else if (target === "Home")   goToPage(1);
        else if (target === "Camera") goToPage(2);
      }
    },
    goBack:         () => goToPage(1),
    replace:        (screen, params) => {
      if (screen === "Result")       navigation.navigate("Result", params);
      else if (screen === "Camera")  goToPage(2);
    },
    addListener:    () => ({ remove: () => {} }),
    removeListener: () => {},
    isFocused:      () => activeIndexRef.current === pageIndex,
  });

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={1}
        onPageSelected={handlePageSelected}
        overdrag
      >
        {/* Page 0 — Setup */}
        <View key="0" style={{ flex: 1 }}>
          <SetupScreen navigation={makeNav(0)} />
        </View>

        {/* Page 1 — Home */}
        <View key="1" style={{ flex: 1 }}>
          <HomeScreen
            navigation={makeNav(1)}
            isFocused={activeIndex === 1}
          />
        </View>

        {/* Page 2 — Camera */}
        <View key="2" style={{ flex: 1 }}>
          <CameraScreen navigation={makeNav(2)} />
        </View>
      </PagerView>

      <CustomTabBar activeIndex={activeIndex} onPress={goToPage} />
    </View>
  );
}

// ── Root stack (MainTabs + Result overlay) ─────────────────────────────────────
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ contentStyle: { backgroundColor: colors.offWhite } }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            animation: "fade",
            contentStyle: { backgroundColor: colors.offWhite },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response.notification.request.content.data);
      }
    );
    return () => sub.remove();
  }, []);

  return <AppNavigator />;
}

// ── Tab bar styles ─────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 24,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: radius.full,
    marginBottom: 6,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 3,
  },
  label: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.medium,
  },
});
