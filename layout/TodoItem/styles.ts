import { COLORS } from "@/constants/ui"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        marginHorizontal: 5,
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 12,
        overflow: "visible",
        borderWidth: 0.3,
        borderColor: COLORS.PRIMARY_BORDER_DARK,
    },
    controlsContainer: {
        flexDirection: "row",
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 8,
    },
    checkTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        flex: 1,
        flexShrink: 1,
        marginRight: 25,
        overflow: "visible",
    },
    checkboxWrapper: {
        position: "relative",
        overflow: "visible",
    },
    textContainer: {
        flex: 1,
        flexShrink: 1,
    },
    dateText: {
        fontSize: 15,
        color: "#aaa",
        marginTop: 2,
    },
})

export const celebrationStyles = StyleSheet.create({
    star: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1000,
    },
})
