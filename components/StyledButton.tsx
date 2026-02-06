import { COLORS } from "@/constants/ui"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native"
import StyledText from "./StyledText"

type StyledButtonProps = TouchableOpacityProps & {
    label?: string
    icon?: React.ComponentProps<typeof Ionicons>['name']
    size?: "small" | "large"
    variant?: "delete" | "edit" | "add" |
    "modal_cancel" | "modal_save" | "modal_delete"
}

const StyledButton: React.FC<StyledButtonProps> = ({ label, icon, size, variant, disabled, ...props }) => {

    const textVariant = (() => {
        if (size === "large") return "heading"
        return "small"
    })()

    const iconSize = size === "large" ? 31 : 17

    const iconColor = (() => {
        if (variant === "delete") return COLORS.PRIMARY_DELETE_BUTTON_TEXT
        if (variant === "edit") return COLORS.PRIMARY_EDIT_BUTTON_TEXT
        if (variant === "add") return COLORS.PRIMARY_ADD_BUTTON_TEXT
        return COLORS.PRIMARY_TEXT
    })()

    return (
        <TouchableOpacity style={[styles.base,
        disabled ? styles.disabled : null,
        size === "small" ? styles.small : null,
        size === "large" ? styles.large : null,
        variant === "modal_cancel" ? styles.modal_cancel : null,
        variant === "modal_save" ? styles.modal_save : null,
        variant === "modal_delete" ? styles.modal_delete : null,
        variant === "delete" ? styles.delete : null,
        variant === "edit" ? styles.edit : null,
        variant === "add" ? styles.add : null]}
            {...props}
            disabled={disabled}>
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
    modal_cancel: {
        backgroundColor: COLORS.PRIMARY_DELETE_BUTTON_ICON,
        borderRadius: 15,
        minWidth: 100
    },
    modal_save: {
        backgroundColor: COLORS.PRIMARY_EDIT_BUTTON_ICON,
        borderRadius: 15,
        minWidth: 100
    },
    modal_delete: {
        backgroundColor: COLORS.PRIMARY_DELETE_BUTTON_ICON,
        borderRadius: 15,
        minWidth: 100
    },
    delete: {
        backgroundColor: COLORS.PRIMARY_DELETE_BUTTON_ICON,
        borderRadius: 25
    },
    edit: {
        backgroundColor: COLORS.PRIMARY_EDIT_BUTTON_ICON,
        borderRadius: 25
    },
    add: {
        backgroundColor: COLORS.PRIMARY_ADD_BUTTON_ICON,
        borderRadius: 25
    }
})

export default StyledButton