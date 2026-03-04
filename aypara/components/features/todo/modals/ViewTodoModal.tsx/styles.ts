import { StyleSheet } from "react-native"

export const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
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
        fontSize: 14,
        fontWeight: "bold",
        textAlign: 'center',
        opacity: 0.9,
        color: colors.PRIMARY_TEXT,
    },
    tableContainer: {
        width: "100%",
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        padding: 4,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    tableRowBorder: {
        borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    },
    tableLabelColumn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tableLabelText: {
        fontSize: 12,
        color: colors.SECTION_TEXT,
        fontWeight: "500",
    },
    tableValueColumn: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    tableValueText: {
        fontSize: 12,
        color: colors.PRIMARY_TEXT,
        fontWeight: "600",
    },
})
