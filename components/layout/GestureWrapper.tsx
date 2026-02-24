import React from 'react';
import { StyleSheet, View } from 'react-native';

type GestureWrapperProps = {
    children: React.ReactNode;
};

/**
 * GestureWrapper is now a pass-through component.
 * Previous swipe-to-home logic has been moved to the global app/_layout.tsx
 * to avoid conflicts and provide a more consistent experience.
 */
const GestureWrapper: React.FC<GestureWrapperProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

export default GestureWrapper;
