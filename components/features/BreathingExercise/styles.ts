import { StyleSheet } from "react-native";
import { COLORS_THEME } from "./constants";

export const getStyles = (isDark: boolean, colors: any) => {
    const textColor = isDark ? COLORS_THEME.text : colors.PRIMARY_TEXT;
    const textMutedColor = isDark ? COLORS_THEME.textMuted : colors.SECTION_TEXT;
    const backgroundLightColor = isDark ? COLORS_THEME.backgroundLight : 'rgba(210, 180, 140, 0.15)';
    const backgroundMediumColor = isDark ? COLORS_THEME.backgroundMedium : 'rgba(210, 180, 140, 0.3)';
    const phaseBadgeBgColor = isDark ? 'rgba(210, 180, 140, 0.15)' : 'rgba(210, 180, 140, 0.25)';
    const soundToggleBgColor = isDark ? 'rgba(210, 180, 140, 0.1)' : 'rgba(210, 180, 140, 0.2)';

    return StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingVertical: 10,
            alignSelf: 'center',
            height: 480, // Fixed height for consistency
        },
        mainContent: {
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        timerContainer: {
            alignItems: 'center',
            marginBottom: 10,
        },
        totalTime: {
            fontSize: 26,
            fontWeight: '700',
            color: textColor,
            letterSpacing: 1.5,
        },
        timeBadge: {
            backgroundColor: backgroundMediumColor,
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: 'rgba(210, 180, 140, 0.3)',
        },
        phaseBadgeContainer: {
            height: 30, // Fixed height space
            justifyContent: 'center',
            marginTop: 5,
        },
        phaseBadge: {
            backgroundColor: phaseBadgeBgColor,
            paddingHorizontal: 10,
            paddingVertical: 2,
            borderRadius: 10,
        },
        durationContainer: {
            height: 50,
            justifyContent: 'center',
            marginBottom: 10,
        },
        durationSelector: {
            flexDirection: 'row',
            gap: 6,
            backgroundColor: backgroundLightColor,
            padding: 4,
            borderRadius: 15,
        },
        durationButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            minWidth: 65,
            alignItems: 'center',
        },
        durationText: {
            color: textMutedColor,
            fontSize: 11,
            fontWeight: '500',
        },
        phaseTime: {
            fontSize: 14,
            color: textMutedColor,
        },
        animationWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginVertical: 10,
        },
        breathingCircle: {
            borderWidth: 6,
            position: 'absolute',
        },
        phaseTextWrapper: {
            zIndex: 10,
        },
        phaseText: {
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 2,
        },
        phaseCounterText: {
            fontWeight: '800',
            textAlign: 'center',
            marginVertical: 4,
        },
        bottomControls: {
            alignItems: 'center',
            width: '100%',
            marginTop: 'auto',
        },
        actionButtonContainer: {
            height: 60,
            justifyContent: 'center',
        },
        startButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 11,
            paddingHorizontal: 34,
            borderRadius: 22,
            gap: 8,
            elevation: 6,
            shadowColor: COLORS_THEME.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
        },
        stopButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 11,
            paddingHorizontal: 34,
            borderRadius: 22,
            gap: 8,
            borderWidth: 1.5,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 0.3,
        },
        completionScreen: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            flex: 1,
        },
        completionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: textColor,
            textAlign: 'center',
            marginBottom: 8,
        },
        completionSubTitle: {
            fontSize: 14,
            color: textMutedColor,
            textAlign: 'center',
        },
        motivationMessage: {
            color: textMutedColor,
            textAlign: 'center',
            marginTop: 3,
            fontWeight: '400',
        },
        topControls: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 10,
            width: '100%',
            justifyContent: 'flex-end',
            paddingHorizontal: 10,
        },
        soundToggle: {
            backgroundColor: soundToggleBgColor,
            padding: 8,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(210, 180, 140, 0.2)',
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
        },
        toggleActive: {
            backgroundColor: COLORS_THEME.primary,
            borderColor: COLORS_THEME.primary,
            shadowColor: COLORS_THEME.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        statusTextContainer: {
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 5,
        },
        statusText: {
            fontSize: 18,
            fontWeight: '600',
            color: textColor,
        },
        countdownText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS_THEME.primary,
        },
    });
};
