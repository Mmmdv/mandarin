import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    ratingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 15,
        paddingHorizontal: 5,
    },
    ratingButton: {
        width: 44,
        height: 44,
        borderRadius: 15, // More of a rounded square look for premium feel
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: {
        padding: 4,
    },
    selectedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionMain: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    selectedValue: {
        fontSize: 54,
        fontWeight: '900',
    },
    maxRating: {
        fontSize: 20,
        marginLeft: 4,
        fontWeight: '600',
        opacity: 0.5,
    },
    feedbackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: -5,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    feedbackText: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
});
