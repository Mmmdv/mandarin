import { COLORS } from "@/constants/ui"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 0,
    },
    greeting: {
        fontSize: 24,
        marginBottom: 4,
        fontWeight: 'bold',
        color: "#FFF"
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    sectionContainer: {
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 0,
        paddingVertical: 12,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
    },
    sectionControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sectionDivider: {
        height: 0.5,
        backgroundColor: "#3a3f47",
        marginHorizontal: 0,
        marginVertical: 10,
    },
})
