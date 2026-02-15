import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Poppins_600SemiBold, useFonts } from '@expo-google-fonts/poppins';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Share, StyleSheet, TouchableOpacity, View } from "react-native";

import NotificationsModal from "@/layout/Modals/NotificationsModal";
import { useAppSelector } from "@/store";
import { selectUnreadCount } from "@/store/slices/notificationSlice";

const Header: React.FC = () => {
  const { colors, t, isDark } = useTheme();
  const router = useRouter();
  const unreadCount = useAppSelector(selectUnreadCount);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

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
          <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} />
        </View>
        <StyledText style={[styles.appName, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>Mandarin</StyledText>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onShare} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons name="share-outline" size={22} color={colors.PRIMARY_TEXT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNotificationsVisible(true)} activeOpacity={0.7} style={styles.iconButton}>
          <View>
            <Ionicons name="notifications-outline" size={22} color={colors.PRIMARY_TEXT} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: colors.ERROR_INPUT_TEXT,
                borderRadius: 10,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 2,
                borderWidth: 1.5,
                borderColor: colors.SECONDARY_BACKGROUND
              }}>
                <StyledText style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: '700',
                  lineHeight: 12
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </StyledText>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/settings")} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color={colors.PRIMARY_TEXT} />
        </TouchableOpacity>
      </View>


      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
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
    width: 32,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  appName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#E5E7EB',
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});

export default Header;
