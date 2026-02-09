import { COLORS } from "@/constants/ui"
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
    variant?: "blue_icon" | "blue_button" | "delete_button"
    disabled?: boolean
    onPress?: () => void
    style?: ViewStyle
    activeOpacity?: number
    vibrate?: boolean
}

const StyledButton: React.FC<StyledButtonProps> = ({ label, icon, size, variant, disabled, onPress, style, activeOpacity, vibrate }) => {

    const textVariant = (() => {
        if (size === "large") return "heading"
        return "small"
    })()

    const iconSize = size === "large" ? 27 : 17

    const iconColor = (() => {
        return COLORS.PRIMARY_ACTIVE_BUTTON_TEXT
    })()

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
                disabled ? styles.disabled : null,
                size === "small" ? styles.small : null,
                size === "large" ? styles.large : null,
                variant === "blue_icon" ? styles.blue_icon : null,
                variant === "blue_button" ? styles.blue_button : null,
                variant === "delete_button" ? styles.delete_button : null,
                style
            ]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={activeOpacity ?? 0.7}
        >
            {label && <StyledText
                variant={textVariant}
                style={{ color: "#ffffffff" }}>
                {label}
            </StyledText>}
            {icon && <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}>
            </Ionicons>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: COLORS.PRIMARY_ACTIVE_BUTTON,
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
    blue_icon: {
        backgroundColor: COLORS.PRIMARY_ACTIVE_BUTTON,
        borderRadius: 25
    },
    blue_button: {
        backgroundColor: COLORS.PRIMARY_ACTIVE_BUTTON,
        borderRadius: 15,
        minWidth: 100
    },
    delete_button: {
        backgroundColor: "#FF6B6B",
        borderRadius: 15,
        minWidth: 100
    }
})

export default StyledButton