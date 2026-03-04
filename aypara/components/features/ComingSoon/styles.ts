import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        paddingBottom: 0, // Account for TabBar height (70 + 20 bottom + 20 padding)
    },
    content: {
        alignItems: "center",
        gap: 20,
        width: "100%",
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        elevation: 5,
        backgroundColor: "#131519", // Default dark, overridden by theme
        shadowColor: "#4ECDC4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 30,
        maxWidth: "80%",
    },
});
