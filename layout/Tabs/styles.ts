import { COLORS } from "@/constants/ui";
import { StyleSheet } from "react-native";




export const styles = StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        backgroundColor: "transparent", // Ensure transparent container
    },
    tabBarWrapper: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 90, // Increased height
        width: '100%',
        borderTopWidth: 0.25,
        borderTopColor: COLORS.PRIMARY_BORDER_DARK,
        borderRadius: 0, // Remove rounded corners if it's a full bottom bar, or keep if it's floating
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
    // tabBackgroundPill removed
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
