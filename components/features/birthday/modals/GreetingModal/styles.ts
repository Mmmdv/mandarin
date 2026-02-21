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
        shadowOpacity: isDark ? 0.3 : 0.2, // Increased opacity for light mode definition
        shadowRadius: isDark ? 20 : 15,    // Tighter shadow for light mode
        elevation: 10,
        backgroundColor: colors.SECONDARY_BACKGROUND,
        borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER, // More distinct border in light mode
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
    greetingsScroll: {
        width: "100%",
        maxHeight: 300,
    },
    greetingCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 8,
        gap: 10,
    },
    greetingEmoji: {
        fontSize: 24,
    },
    greetingText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    copyIcon: {
        padding: 4,
    },
    customContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    customInput: {
        flex: 1,
        fontSize: 13,
        minHeight: 44,
        textAlignVertical: "top",
    },
    sendButton: {
        padding: 8,
    },
    closeButton: {
        width: "100%",
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
    },
    closeText: {
        fontSize: 14,
        fontWeight: "500",
    },
})
