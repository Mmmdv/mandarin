import { StyleSheet } from "react-native"

export const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 0.2,
        padding: 24,
        width: 340,
        maxWidth: "90%",
        gap: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.3 : 0.2,
        shadowRadius: isDark ? 20 : 15,
        elevation: 10,
        backgroundColor: colors.SECONDARY_BACKGROUND,
        borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: 'center',
        opacity: 0.8,
        color: colors.PRIMARY_TEXT,
    },
    messageText: {
        fontSize: 14,
        color: colors.PLACEHOLDER,
        textAlign: "center",
        lineHeight: 20,
    },
    instructionBox: {
        width: "100%",
        borderRadius: 16,
        padding: 16,
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        marginVertical: 4,
    },
    instructionText: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        color: colors.PRIMARY_TEXT,
    },
    instructionDetail: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.PLACEHOLDER,
    },
})
