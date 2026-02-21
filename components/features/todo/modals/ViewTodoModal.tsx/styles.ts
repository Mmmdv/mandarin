import { StyleSheet } from "react-native"

export const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        minWidth: 340,
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
    titleSection: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 16,
        marginBottom: 8,
    },
    titleLabel: {
        fontSize: 13,
        color: isDark ? "#aca9a9ff" : "#666",
        fontWeight: "bold",
        marginBottom: 8,
    },
    titleValue: {
        width: '100%',
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        fontWeight: "bold",
        paddingHorizontal: 16,
        textAlign: 'left',
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
        color: isDark ? "#aca9a9ff" : "#666",
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
    statusBadge: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },
    statusTextGeneric: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusTextCancelled: {
        color: colors.ERROR_INPUT_TEXT,
    },
    statusTextPending: {
        color: colors.REMINDER,
    },
    statusTextSent: {
        color: colors.CHECKBOX_SUCCESS,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
})
