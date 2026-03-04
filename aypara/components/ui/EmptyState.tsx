import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import StyledText from "./StyledText";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonText,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 800 });
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 }),
      ),
      -1,
      true,
    );
  }, [floatAnim, opacity, scale]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedContainerStyle]}>
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            },
            animatedIconStyle,
          ]}
        >
          <View
            style={[
              styles.glow,
              { backgroundColor: colors.PRIMARY_TEXT, opacity: 0.1 },
            ]}
          />
          <Ionicons
            name={icon}
            size={60}
            color={isDark ? colors.PRIMARY_TEXT : "#444"}
          />
        </Animated.View>

        <StyledText
          style={[
            styles.title,
            { color: colors.PRIMARY_TEXT, marginBottom: description ? 12 : 0 },
          ]}
        >
          {title}
        </StyledText>

        {description && (
          <StyledText
            style={[styles.description, { color: colors.SECTION_TEXT }]}
          >
            {description}
          </StyledText>
        )}

        {buttonText && onPress && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
              styles.button,
              {
                backgroundColor: "#234E94", // Premium blue from the filter selection
                shadowColor: "#234E94",
              },
            ]}
          >
            <Ionicons
              name="add"
              size={24}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <StyledText style={styles.buttonText}>{buttonText}</StyledText>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default EmptyState;
