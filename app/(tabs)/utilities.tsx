import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

import Header from "@/layout/Header";

export default function Utilities() {
    const { colors, t } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
            <Header />
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <StyledText>{t("tab_utilities")}</StyledText>
            </View>
        </View>
    );
}
