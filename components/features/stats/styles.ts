import { StyleSheet } from "react-native";

export const statsStyles = StyleSheet.create({
    section: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden'
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    accentCorner: {
        position: 'absolute',
        left: -18,
        top: -18,
        width: 32,
        height: 32,
        borderTopLeftRadius: 24,
        borderLeftWidth: 4,
        borderTopWidth: 4,
        backgroundColor: 'transparent'
    },
    sectionIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700'
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 10
    },
    statCard: {
        flex: 1,
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
        gap: 8
    },
    statIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800'
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    completionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 18
    },
    completionCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    completionPercent: {
        fontSize: 26,
        fontWeight: '800'
    },
    completionLabel: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    completionDetails: {
        flex: 1,
        gap: 10
    },
    completionDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    detailDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    detailLabel: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500'
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700'
    },
    avgTimeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16
    },
    avgTimeLabel: {
        fontSize: 12,
        fontWeight: '500'
    },
    avgTimeValue: {
        fontSize: 17,
        fontWeight: '700',
        marginTop: 2
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 13,
        paddingVertical: 10
    },
    chipsContainer: {
        paddingHorizontal: 20,
        gap: 8,
        paddingTop: 4,
        paddingBottom: 12,
        flexGrow: 1,
        justifyContent: 'center'
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    chipText: {
        fontSize: 13,
        marginBottom: 2
    },
    chipDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff'
    },
    periodLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 4,
        marginBottom: 10
    },
    periodLabelText: {
        fontSize: 13,
        fontWeight: '500'
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 15
    },
    avgBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    moodSpectrum: {
        height: 12,
        flexDirection: 'row',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#e9ecef20',
        marginTop: 4
    },
    moodChipsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    moodChip: {
        flex: 1,
        minWidth: '30%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 12
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        top: 6,
        right: 6
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    },
    ratingSummary: {
        alignItems: 'center',
        minWidth: 80
    },
    ratingAvgText: {
        fontSize: 36,
        fontWeight: '800'
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginVertical: 4
    },
    ratingTotalText: {
        fontSize: 11,
        fontWeight: '500'
    },
    ratingBreakdown: {
        flex: 1,
        gap: 4
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    breakdownLabel: {
        fontSize: 11,
        fontWeight: '700',
        minWidth: 10
    },
    breakdownBarBg: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden'
    },
    breakdownBarFill: {
        height: '100%',
        borderRadius: 3
    },
});
