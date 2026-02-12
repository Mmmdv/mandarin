import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        position: 'relative',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        zIndex: 10,
    },
    titleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    rightPlaceholder: {
        minWidth: 40,
        alignItems: 'flex-end',
        zIndex: 10,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        marginRight: 8,
    },
    itemDate: {
        fontSize: 12,
        color: "#888",
    },
    itemBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
    },
});
