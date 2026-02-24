import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Lobster_400Regular, useFonts } from '@expo-google-fonts/lobster';
import React, { forwardRef } from "react";
import { ImageBackground, StyleSheet, View, useWindowDimensions } from "react-native";
import ViewShot from "react-native-view-shot";

export type BirthdayBackgroundHandle = 'v1' | 'v2' | 'v3'

const BACKGROUNDS = {
    v1: require("@/assets/images/Birthday/birthday_background_v1.jpg"),
    v2: require("@/assets/images/Birthday/birthday_background_v2.jpg"),
    v3: require("@/assets/images/Birthday/birthday_background_v3.jpg"),
};

type BirthdayCardPreviewProps = {
    message: string;
    backgroundHandle: BirthdayBackgroundHandle;
};

const BirthdayCardPreview = forwardRef<ViewShot, BirthdayCardPreviewProps>(({ message, backgroundHandle }, ref) => {
    const { t } = useTheme();
    const { width: W } = useWindowDimensions();
    const CARD_WIDTH = W * 0.53;
    const CARD_HEIGHT = 255;

    const [isImageLoaded, setIsImageLoaded] = React.useState(false);
    const [fontsLoaded] = useFonts({
        Lobster_400Regular,
    });

    if (!fontsLoaded) return (
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: 'transparent' }} />
    );

    const isDarkBg = backgroundHandle === 'v1' || backgroundHandle === 'v2' || backgroundHandle === 'v3';
    const textColor = isDarkBg ? '#fadb75ff' : '#fadb75ff'; // Premium Gold color for dark backgrounds

    return (
        <View pointerEvents="none" style={{ borderRadius: 15, overflow: 'hidden', opacity: isImageLoaded ? 1 : 0 }}>
            <ViewShot ref={ref} options={{ format: 'jpg', quality: 0.9 }} style={[styles.viewShot, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
                <ImageBackground
                    source={BACKGROUNDS[backgroundHandle]}
                    style={styles.background}
                    resizeMode="stretch"
                    onLoad={() => setIsImageLoaded(true)}
                >
                    {/* Main Greeting Message */}
                    <View style={[styles.textContainer, {
                        left: CARD_WIDTH * 0.400,
                        top: CARD_HEIGHT * -0.01,
                        width: CARD_WIDTH * 0.370,
                        height: CARD_HEIGHT * 0.500,
                        transform: [{ rotate: '10deg' }],
                    }]}>
                        <StyledText style={[styles.messageText, { fontSize: CARD_WIDTH * 0.045, color: textColor, opacity: 0.95 }]}>
                            {message}
                        </StyledText>
                    </View>

                    {/* Happy Birthday Static Text */}
                    <View style={[styles.nameContainer, {
                        left: CARD_WIDTH * 0.15,
                        top: CARD_HEIGHT * 0.52,
                        width: CARD_WIDTH * 0.250,
                        height: CARD_HEIGHT * 0.500,
                        transform: [{ rotate: '14deg' }],
                    }]}>
                        <StyledText style={[styles.nameText, { fontSize: CARD_WIDTH * 0.045, color: textColor, opacity: 0.9 }]}>
                            {t("birthday_happy_birthday")}
                        </StyledText>
                    </View>
                </ImageBackground>
            </ViewShot>
        </View>
    );
});

const styles = StyleSheet.create({
    viewShot: {
        overflow: 'hidden',
        alignSelf: 'center',
    },
    background: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontFamily: 'Lobster_400Regular',
        color: '#4A2B0F',
        textAlign: 'center',
        letterSpacing: 1,
    },
    nameContainer: {
        position: 'absolute',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    nameText: {
        fontFamily: 'Lobster_400Regular',
        textAlign: 'right',
        letterSpacing: 1,
    },
});

export default BirthdayCardPreview;
