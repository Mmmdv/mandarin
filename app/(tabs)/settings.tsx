import StyledText from "@/components/StyledText";
import { COLORS } from "@/constants/ui";
import { StatusBar, StyleSheet, View } from "react-native";

export default function Settings() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle={"light-content"}></StatusBar>
            <View style={styles.content}>
                <StyledText variant="heading" style={styles.title}>
                    Settings
                </StyledText>
                <StyledText style={styles.text}>
                    Tənzimləmələr tezliklə əlavə olunacaq...
                </StyledText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.PRIMARY_BACKGROUND,
        paddingBottom: 100,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        textAlign: "center",
    },
});
