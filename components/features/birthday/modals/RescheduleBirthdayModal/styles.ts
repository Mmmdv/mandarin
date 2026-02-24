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
    presetsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        width: '100%'
    },
    presetButton: {
        flex: 1,
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
    },
    presetText: {
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center'
    },
    buttonsContainerMargin: {
        marginTop: 16
    }
});
