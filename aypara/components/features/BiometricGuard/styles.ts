import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    circleOverlay: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockIconContainer: {
        width: 110,
        height: 110,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    retryButton: {
        width: width * 0.65,
        height: 56,
        borderRadius: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.5,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
});
