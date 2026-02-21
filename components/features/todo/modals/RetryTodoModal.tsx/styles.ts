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
    optionsContainer: {
        width: '100%',
        gap: 10,
        marginVertical: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    optionButton: {
        flex: 1,
    }
})
