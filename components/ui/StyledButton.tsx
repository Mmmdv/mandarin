import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import React from "react"
import { StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import StyledText from "./StyledText"

type StyledButtonProps = {
    label?: string
    icon?: React.ComponentProps<typeof Ionicons>['name']
    size?: "small" | "large"
    variant?: "blue_icon" | "blue_button" | "delete_button" | "gray_button" | "dark_button"
    disabled?: boolean
    onPress?: () => void
    style?: ViewStyle
    activeOpacity?: number
    vibrate?: boolean
    shadowColor?: string
}

const StyledButton: React.FC<StyledButtonProps> = ({ label, icon, size, variant, disabled, onPress, style, activeOpacity, vibrate, shadowColor }) => {
    const { colors, isDark } = useTheme();

    const textVariant = size === "large" ? "heading" : "small"
    const iconSize = size === "large" ? 27 : 17

    // Determine dynamic text and icon color based on variant and theme
    const getContrastColor = () => {
        if (variant === "dark_button") {
            return isDark ? colors.PRIMARY_TEXT : "#FFFFFF";
        }
        return colors.PRIMARY_ACTIVE_BUTTON_TEXT; // White by default for active/colored buttons
    }

    const contrastColor = getContrastColor();

    const handlePress = () => {
        if (vibrate) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        onPress?.();
    }

    return (
        <TouchableOpacity
            style={[
                styles.base,
                { backgroundColor: colors.PRIMARY_ACTIVE_BUTTON, borderColor: colors.PRIMARY_BORDER_DARK },
                disabled ? styles.disabled : null,
                size === "small" ? styles.small : null,
                size === "large" ? styles.large : null,
                variant === "blue_icon" ? { backgroundColor: colors.PRIMARY_ACTIVE_BUTTON, borderRadius: 25 } : null,
                variant === "blue_button" ? {
                    backgroundColor: colors.PRIMARY_ACTIVE_BUTTON,
                    borderRadius: 15,
                    minWidth: 100,
                    borderWidth: 1,
                    borderColor: colors.PRIMARY_BORDER_DARK,
                    shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 10,
                } : null,
                variant === "delete_button" ? styles.delete_button : null,
                variant === "gray_button" ? styles.gray_button : null,
                variant === "dark_button" ? {
                    backgroundColor: isDark ? colors.SECONDARY_BACKGROUND : "#3e5a8bff",
                    borderRadius: 15,
                    minWidth: 100,
                    borderWidth: 1,
                    borderColor: isDark ? colors.PRIMARY_BORDER_DARK : "transparent",
                    shadowColor: isDark ? colors.CHECKBOX_SUCCESS : "#3e5a8b",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                } : null,
                shadowColor ? { shadowColor: shadowColor } : null,
                style
            ]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={activeOpacity ?? 0.7}
        >
            {label && <StyledText
                variant={textVariant}
                style={{ color: contrastColor }}>
                {label}
            </StyledText>}
            {icon && <Ionicons
                name={icon}
                size={iconSize}
                color={contrastColor}>
            </Ionicons>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    base: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 5,
        borderWidth: 0.5,
    },
    disabled: {
        opacity: 0.5
    },
    small: {
        paddingVertical: 8,
        paddingHorizontal: 8
    },
    large: {
        paddingVertical: 10,
        paddingHorizontal: 10
    },
    delete_button: {
        backgroundColor: "#FF6B6B",
        borderRadius: 15,
        minWidth: 100,
        borderWidth: 1,
        shadowColor: "#FF6B6B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    gray_button: {
        backgroundColor: "#666",
        borderRadius: 15,
        minWidth: 100,
        borderWidth: 1,
        shadowColor: "#666",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
})

export default React.memo(StyledButton)
