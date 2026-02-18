import { StyleSheet } from "react-native"
import { COLORS } from "./ui"

export const modalStyles = StyleSheet.create({
    modalContainer: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: "#3a3f47",
        padding: 20,
        minWidth: 280,
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
        textAlign: "center",
    },
    divider: {
        height: 0.5,
        backgroundColor: "#3a3f47",
        width: "100%",
    },
    messageText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
    },
})
