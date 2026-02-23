import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

export const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        width: width * 0.9,
        maxWidth: 400,
        alignItems: 'center',
        backgroundColor: colors.SECONDARY_BACKGROUND,
        borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 15,
        gap: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: 'center',
        color: colors.PRIMARY_TEXT,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4D4F',
    },
    recordingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF4D4F',
    },
    canvasContainer: {
        width: '100%',
        height: 300,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: 20,
    },
    canvasReplaying: {
        borderColor: '#40A9FF',
        borderWidth: 2,
    },
    canvas: {
        flex: 1,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
        gap: 8,
    },
    toolButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
        borderWidth: 1,
    },
    clearButton: {
        borderColor: '#FF4D4F',
        backgroundColor: 'transparent',
    },
    clearText: {
        color: '#FF4D4F',
        fontWeight: '600',
        fontSize: 12,
    },
    replayButton: {
        borderColor: '#40A9FF',
        backgroundColor: 'transparent',
    },
    replayText: {
        color: '#40A9FF',
        fontWeight: '600',
        fontSize: 12,
    },
    sendButton: {
        backgroundColor: '#D4880F',
        borderColor: '#D4880F',
        flex: 1.2,
    },
    sendText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },
    footerButtons: {
        width: '100%',
        alignItems: 'center',
    }
})
