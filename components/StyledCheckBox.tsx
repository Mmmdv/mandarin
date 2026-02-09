import { COLORS } from "@/constants/ui"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import React from "react"
import { TouchableOpacity } from "react-native"

type StyledCheckBoxProps = {
    checked: boolean
    onCheck: () => void
}

const StyledCheckBox: React.FC<StyledCheckBoxProps> = ({ checked, onCheck }) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onCheck();
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <Ionicons
                name={checked ? "checkmark-circle-sharp" : "ellipse-outline"}
                size={25}
                textColor="white"
                color={checked ? COLORS.CHECKBOX_SUCCESS : COLORS.CHECKBOX_INACTIVE} />
        </TouchableOpacity>
    )
}

export default StyledCheckBox   