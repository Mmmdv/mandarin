import { COLORS } from "@/constants/ui";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const VISIBLE_TABS = 5;
export const SIDE_ITEMS = 50;
export const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.75;
export const TAB_WIDTH = TAB_BAR_WIDTH / VISIBLE_TABS;

export const styles = StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    tabBarWrapper: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 25,
        borderWidth: 0.6,
        borderColor: COLORS.PRIMARY_BORDER_DARK,
        height: 70,
        width: TAB_BAR_WIDTH,
        overflow: "hidden",
    },
    scrollContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: (TAB_BAR_WIDTH - TAB_WIDTH) / 2,
    },
    tabButton: {
        width: TAB_WIDTH,
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
    tabBackgroundPill: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#353f50ff",
        borderRadius: 15,
        zIndex: 0,
    },
    tabItemContent: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    tabLabel: {
        fontSize: 8.5,
        marginTop: 3,
        textAlign: "center",
    },
});
