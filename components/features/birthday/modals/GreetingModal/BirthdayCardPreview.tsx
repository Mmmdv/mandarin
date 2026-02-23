import StyledText from "@/components/ui/StyledText";
import { Lobster_400Regular, useFonts } from '@expo-google-fonts/lobster';
import React, { forwardRef } from "react";
import { Dimensions, ImageBackground, StyleSheet, View } from "react-native";
import ViewShot from "react-native-view-shot";

const { width: W } = Dimensions.get('window');
const CARD_WIDTH = W * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

export type BirthdayBackgroundHandle = 'v1' | 'v2' | 'v3' | 'v4';

const BACKGROUNDS = {
    v1: require("@/assets/images/Birthday/birthday_background_v1.webp"),
    v2: require("@/assets/images/Birthday/birthday_background_v2.webp"),
    v3: require("@/assets/images/Birthday/birthday_background_v3.webp"),
    v4: require("@/assets/images/Birthday/birthday_background_v4.webp"),
};

type BirthdayCardPreviewProps = {
    message: string;
    backgroundHandle: BirthdayBackgroundHandle;
};

const BirthdayCardPreview = forwardRef<ViewShot, BirthdayCardPreviewProps>(({ message, backgroundHandle }, ref) => {
    const [fontsLoaded] = useFonts({
        Lobster_400Regular,
    });

    if (!fontsLoaded) return null;

    return (
        <ViewShot ref={ref} options={{ format: 'png', quality: 1.0 }} style={styles.viewShot}>
            <ImageBackground
                source={BACKGROUNDS[backgroundHandle]}
                style={styles.background}
                resizeMode="stretch"
            >
                <View style={styles.textContainer}>
                    <StyledText style={styles.messageText}>
                        {message}
                    </StyledText>
                </View>
            </ImageBackground>
        </ViewShot>
    );
});

const styles = StyleSheet.create({
    viewShot: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    background: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        position: 'absolute',
        left: CARD_WIDTH * 0.167,
        top: CARD_HEIGHT * 0.25, // Moved up from 0.313
        width: CARD_WIDTH * 0.676,
        height: CARD_HEIGHT * 0.410,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontFamily: 'Lobster_400Regular',
        fontSize: CARD_WIDTH * 0.08, // Reduced from 0.08
        color: '#4A2B0F',
        textAlign: 'center',
    },
});

export default BirthdayCardPreview;
