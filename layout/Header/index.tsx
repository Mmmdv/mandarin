import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import SettingsModal from "@/layout/Modals/SettingsModal.tsx";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Share, StyleSheet, TouchableOpacity, View } from "react-native";

const Header: React.FC = () => {
  const { colors, t } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const onShare = async () => {
    try {
      await Share.share({
        message: t("share_message"),
      });
    } catch (error) {
      // silently ignore
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.SECONDARY_BACKGROUND, borderBottomColor: colors.PRIMARY_BORDER_DARK }]}>
      <View style={styles.leftSection}>
        <View style={styles.iconWrapper}>
          <Image source={require("@/assets/images/nar_4_1_1.png")} style={styles.logoImage} />
        </View>
        <StyledText style={styles.appName}>Nar</StyledText>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color={colors.PRIMARY_TEXT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons name="share-outline" size={22} color={colors.PRIMARY_TEXT} />
        </TouchableOpacity>
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rightSection: {
    flexDirection: "row",
    gap: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#a11708ff",
    letterSpacing: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});

export default Header;
