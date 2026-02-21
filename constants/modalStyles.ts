import { StyleSheet } from "react-native";
import { DarkTheme } from "./ui";

export const getModalStyles = (colors: any) => StyleSheet.create({
    modalContainer: {
        backgroundColor: colors.SECONDARY_BACKGROUND,
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: colors.PRIMARY_BORDER_DARK,
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
        color: colors.PRIMARY_TEXT,
        textAlign: "center",
    },
    divider: {
        height: 0.3,
        backgroundColor: colors.PRIMARY_BORDER_DARK,
        width: "100%",
        opacity: 0.15,
    },
    messageText: {
        fontSize: 14,
        color: colors.PLACEHOLDER,
        textAlign: "center",
    },
    button: {
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
    },
})

export const modalStyles = getModalStyles(DarkTheme);
