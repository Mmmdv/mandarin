import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

import Header from "@/layout/Header";

export default function Movies() {
    const { colors, t } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
            <Header />
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <StyledText>{t("tab_movies")}</StyledText>
            </View>
        </View>
    );
}
