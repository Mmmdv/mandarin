import StyledText from "@/components/StyledText";
import { COLORS } from "@/constants/ui";
import { StatusBar, StyleSheet, View } from "react-native";

export default function About() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle={"light-content"}></StatusBar>
            <View style={styles.content}>
                <StyledText variant="heading" style={styles.title}>
                    About
                </StyledText>
                <StyledText style={styles.text}>
                    Todo List App v1.0
                </StyledText>
                <StyledText style={styles.text}>
                    Bu tətbiq sizə tapşırıqlarınızı idarə etməyə kömək edir.
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
        marginBottom: 10,
    },
});
