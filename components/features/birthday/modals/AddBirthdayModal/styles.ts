import { StyleSheet } from "react-native";

export const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({

    iconContainer: {
        backgroundColor: colors.SECONDARY_BACKGROUND,
        shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2
    },
    scrollView: {
        width: '100%',
        maxHeight: 400
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 10
    },
    inputInline: {
        textAlign: 'right',
        padding: 0,
        minWidth: 100,
    },
    nameRow: {
        borderRadius: 12
    },
    dateRow: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12
    },
    phoneInput: {
        color: colors.PLACEHOLDER
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        marginTop: 4,
        borderRadius: 12,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderWidth: 0.5,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.SECTION_TEXT
    },
    inputError: {
        borderColor: "#FF6B6B",
        borderWidth: 0.2,
        backgroundColor: isDark ? "rgba(255, 107, 107, 0.05)" : "rgba(255, 107, 107, 0.02)",
    },
    buttonsContainerMargin: {
        marginTop: 16
    }
});
