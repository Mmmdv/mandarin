import { StyleSheet } from "react-native";

export const getSettingsStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        borderRadius: 20,
        padding: 24,
        borderWidth: 0.5,
        borderColor: colors.PRIMARY_BORDER_DARK,
        backgroundColor: colors.SECONDARY_BACKGROUND,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.PRIMARY_TEXT,
    },
    section: {
        marginBottom: 24,
    },
    divider: {
        height: 0.3,
        width: '100%',
        marginVertical: 24,
        backgroundColor: colors.PRIMARY_BORDER_DARK,
        opacity: 0.1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
        color: colors.PLACEHOLDER,
        marginLeft: 4,
        opacity: 0.9,
    },
    optionsContainer: {
        flexDirection: "row",
        gap: 12,
    },
    optionButton: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 0.2,
        borderColor: colors.PRIMARY_BORDER_DARK,
        backgroundColor: colors.TAB_BAR,
        alignItems: "center",
        justifyContent: "center",
    },
    optionText: {
        fontWeight: "600",
        fontSize: 14,
    },
    aboutContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 0.2,
        borderColor: colors.PRIMARY_BORDER_DARK,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 0.2,
        borderColor: colors.PRIMARY_BORDER_DARK,
        backgroundColor: colors.SECONDARY_BACKGROUND,
    },
    aboutLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: colors.PRIMARY_TEXT,
    },
    aboutValue: {
        fontSize: 15,
        color: colors.PLACEHOLDER,
    },
});

// For backward compatibility
import { DarkTheme } from "@/constants/ui";
export const styles = getSettingsStyles(DarkTheme);
