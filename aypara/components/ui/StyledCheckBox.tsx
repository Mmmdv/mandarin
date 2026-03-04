import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { TouchableOpacity } from "react-native"

type StyledCheckBoxProps = {
    checked: boolean
    onCheck: () => void
    hitSlop?: { top: number, bottom: number, left: number, right: number } | number
}

const StyledCheckBox: React.FC<StyledCheckBoxProps> = ({ checked, onCheck, hitSlop = 10 }) => {
    const { colors } = useTheme();
    const handlePress = () => {
        onCheck();
    }

    return (
        <TouchableOpacity onPress={handlePress} hitSlop={hitSlop}>
            <Ionicons
                name={checked ? "checkbox" : "square-outline"}
                size={20.5}
                color={checked ? colors.CHECKBOX_SUCCESS : colors.CHECKBOX_INACTIVE} />
        </TouchableOpacity>
    )
}

export default StyledCheckBox
