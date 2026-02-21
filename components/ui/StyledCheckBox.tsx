import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { TouchableOpacity } from "react-native"

type StyledCheckBoxProps = {
    checked: boolean
    onCheck: () => void
}

const StyledCheckBox: React.FC<StyledCheckBoxProps> = ({ checked, onCheck }) => {
    const { colors } = useTheme();
    const handlePress = () => {
        onCheck();
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <Ionicons
                name={checked ? "checkbox" : "square-outline"}
                size={20.5}
                color={checked ? colors.CHECKBOX_SUCCESS : colors.CHECKBOX_INACTIVE} />
        </TouchableOpacity>
    )
}

export default StyledCheckBox
