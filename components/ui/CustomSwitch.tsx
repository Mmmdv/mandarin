import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ value, onValueChange, activeColor }) => {
    const { colors } = useTheme();
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: value ? 1 : 0,
            useNativeDriver: false,
            friction: 8,
            tension: 50,
        }).start();
    }, [value]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 18], // Adjusted for 40px width and 20px thumb
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#767577', activeColor || colors.CHECKBOX_SUCCESS],
    });

    const handlePress = () => {
        onValueChange(!value);
    };

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
            <Animated.View style={[styles.container, { backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [{ translateX }],
                            backgroundColor: '#FFFFFF',
                        },
                    ]}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 22,
        borderRadius: 15,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    thumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});

export default CustomSwitch;
