import { COLORS } from "@/constants/ui";
import { StyleSheet } from "react-native";

export const localStyles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 60,
        width: "100%",
    },
    inputFocused: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderWidth: 1,
        shadowColor: "rgba(255, 255, 255, 0.5)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    inputError: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    },
    textInput: {
        color: COLORS.PRIMARY_TEXT,
        fontSize: 16,
        minHeight: 40,
        textAlign: 'left',
        textAlignVertical: 'center',
        paddingHorizontal: 8,
        lineHeight: 16,
    },
    sectionLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5
    },
    pickerRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },
    pickerButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#151616ff",
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#3a3f47",
        gap: 8,
    },
    pickerButtonActive: {
        borderColor: "#5BC0EB",
        backgroundColor: "rgba(91, 192, 235, 0.05)"
    },
    pickerText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "500"
    },
    addReminderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: "#151616ff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3f47",
        gap: 10,
    },
    addReminderText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "500",
    },
    reminderChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#39b2e6ff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 35,
        position: 'relative',
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chipText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        textAlign: 'center',
    },
    clearButton: {
        position: 'absolute',
        right: 5,
        padding: 4,
    },
    iosPickerContainer: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 20,
        paddingBottom: 20,
        width: '100%',
        overflow: 'hidden',
    },
    iosHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    iosTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_TEXT,
    },
    iconButton: {
        padding: 4,
    },
    pickerWrapper: {
        marginTop: 10,
        width: '100%',
        height: 150,
        justifyContent: 'center',
        overflow: 'hidden',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    }
});
