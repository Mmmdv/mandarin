import { StyleSheet } from "react-native";

export const getStyles = (colors: any) => StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    tabBarWrapper: {
        backgroundColor: colors.SECONDARY_BACKGROUND,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 90,
        width: '100%',
        borderTopWidth: 0.25,
        borderTopColor: colors.PRIMARY_BORDER_DARK,
    },
    tabButton: {
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabItemContainer: {
        width: "100%",
        height: "80%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabItemContent: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    tabLabel: {
        fontSize: 9,
        marginTop: 5,
        textAlign: "center",
    },
});
