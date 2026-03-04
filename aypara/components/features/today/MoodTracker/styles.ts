import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    moodsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moodButton: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    moodLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
    votedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    waitingContainer: {
        marginTop: 5,
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 209, 209, 0.1)',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    waitingTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    unlockText: {
        fontSize: 12,
    },
    clockRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resetButton: {
        marginTop: 5,
        padding: 5,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
