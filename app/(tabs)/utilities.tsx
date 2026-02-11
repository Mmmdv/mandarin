import ComingSoon from "@/components/ComingSoon";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

export default function Utilities() {
    const { colors } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
            <ComingSoon />
        </View>
    );
}
