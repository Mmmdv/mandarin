import { COLORS } from "@/constants/ui";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
export const GAP = 12;
export const PADDING = 20;
export const COL_2_WIDTH = (width - (PADDING * 2) - GAP) / 2;
export const COL_3_WIDTH = (width - (PADDING * 2) - (GAP * 2)) / 3;

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 0,
        backgroundColor: colors.PRIMARY_BACKGROUND,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: PADDING,
        paddingTop: 15,
        paddingBottom: 15,
        zIndex: 10,
    },
    greeting: {
        fontSize: 24,
        marginBottom: 4,
        fontWeight: 'bold',
        color: colors.PRIMARY_TEXT,
    },
    scrollContent: {
        paddingHorizontal: PADDING,
        paddingBottom: 100,
        gap: GAP,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: GAP,
    },
    card: {
        borderRadius: 24,
        padding: 12,
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        zIndex: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 16,
    },
    decorativeCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        bottom: -20,
        right: -20,
        zIndex: 1,
    },
    viewToggleButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.SECONDARY_BACKGROUND,
    },
    listContainer: {
        gap: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        padding: 14,
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: colors.SECONDARY_BACKGROUND,
    },
    listIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listTextContainer: {
        flex: 1,
        gap: 2,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.PRIMARY_TEXT,
    },
    listDesc: {
        fontSize: 13,
        lineHeight: 18,
        color: colors.SECTION_TEXT,
    },
    separatorContainer: {
        marginTop: 28,
        marginBottom: 10,
        alignItems: 'center',
    },
    separatorLine: {
        width: 25,
        height: 1,
        borderRadius: 5,
        backgroundColor: colors.PRIMARY_BORDER,
    },
});

// Export a default styles object to prevent crashes in files still using the old import
export const styles = getStyles(COLORS);
