import { COLORS } from "@/constants/ui"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { TouchableOpacity } from "react-native"

type StyledCheckBoxProps = {
    checked: boolean
    onCheck: () => void
}

const StyledCheckBox: React.FC<StyledCheckBoxProps> = ({ checked, onCheck }) => {
    return (
        <TouchableOpacity onPress={onCheck}>
            <Ionicons
                name={checked ? "checkmark-circle-sharp" : "ellipse-outline"}
                size={25}
                textColor="white"
                color={checked ? COLORS.CHECKBOX_SUCCESS : COLORS.CHECKBOX_INACTIVE} />
        </TouchableOpacity>
    )
}

export default StyledCheckBox   