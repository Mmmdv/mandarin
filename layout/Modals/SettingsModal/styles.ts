import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    section: {
        marginBottom: 20,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 20,
        opacity: 0.5,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 10,
        opacity: 0.8,
    },
    optionsContainer: {
        flexDirection: "row",
        gap: 10,
    },
    optionButton: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    optionText: {
        fontWeight: "600",
    },
    aboutContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
    },
    aboutLabel: {
        fontSize: 16,
    },
    aboutValue: {
        fontSize: 16,
    },
});
