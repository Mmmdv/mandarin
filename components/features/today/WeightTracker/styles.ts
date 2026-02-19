import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        marginTop: 10,
    },
    rulerContainer: {
        height: 65,
        position: 'relative',
        justifyContent: 'center',
    },
    pointer: {
        position: 'absolute',
        top: 0,
        left: '50%',
        width: 3.5,
        height: 45,
        zIndex: 10,
        borderRadius: 2,
        marginLeft: -1.75,
    },
    tickContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 60,
    },
    tick: {
        borderRadius: 1.5,
    },
    tickLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 6,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
        marginBottom: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonUnit: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    selectedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    weightValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    selectedValue: {
        fontSize: 48,
        fontWeight: '900',
    },
    unit: {
        fontSize: 20,
        marginLeft: 6,
        fontWeight: '600',
        opacity: 0.7,
    },
    feedbackBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: -5,
    },
    diffText: {
        fontSize: 14,
        fontWeight: '700',
    },
    headerButton: {
        padding: 6,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
