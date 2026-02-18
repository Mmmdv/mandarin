import { COLORS } from "@/constants/ui"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 20,
        backgroundColor: COLORS.PRIMARY_BACKGROUND,
        zIndex: 10,
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
        gap: 6,
        width: 155, // Fixed width for titles to align subsequent icons
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
    },
    sectionControls: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    actionZone: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sortZone: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
    },
    chevronZone: {
        width: 24,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    sectionDivider: {
        height: 0,
        opacity: 0,
    },
    viewToggleButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    sectionHeaderCard: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 20,
        paddingVertical: 13,
        borderRadius: 20,
        marginTop: 6,
        marginBottom: 5,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitleCard: {
        fontSize: 15,
        fontWeight: "600",
        color: '#FFF',
    },
    cardBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 4,
    },
    cardBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    decorativeCircle: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        bottom: -20,
        right: -20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 1,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
