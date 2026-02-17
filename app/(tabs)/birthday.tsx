import ComingSoon from "@/components/ComingSoon";
import GestureWrapper from "@/components/GestureWrapper";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

export default function Birthday() {
    const { colors, t } = useTheme();

    return (
        <GestureWrapper>
            <View style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
                <ComingSoon title={t("tab_birthday")} />
            </View>
        </GestureWrapper>
    );
}
