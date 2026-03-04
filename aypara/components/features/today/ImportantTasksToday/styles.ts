import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        opacity: 0.7,
    },
    tasksContainer: {
        gap: 6,
    },
    taskItem: {
        borderRadius: 10,
        paddingVertical: 21, // Increased height
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    taskContent: {
        gap: 6, // Increased from 2
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priorityDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    taskTitle: {
        fontSize: 14, // Back to 14
        fontWeight: '600',
        flex: 1,
    },
    taskFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 11, // Increased from 9
        fontWeight: '500',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36, // Reduced height
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    viewAllText: {
        color: '#FFF',
        fontSize: 15, // Reduced font size
        fontWeight: '600',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
