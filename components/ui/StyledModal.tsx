import { useTheme } from "@/hooks/useTheme"
import React, { useEffect, useState } from "react"
import { Keyboard, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, UIManager } from "react-native"

type StyledModalProps = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    closeOnOverlayPress?: boolean
}

const StyledModal: React.FC<StyledModalProps> = ({ isOpen, onClose, children, closeOnOverlayPress }) => {
    const { colors, isDark } = useTheme();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (UIManager.setLayoutAnimationEnabledExperimental) {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            }
        }
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    return (
        <Modal
            visible={isOpen}
            onRequestClose={onClose}
            animationType="fade"
            transparent={true}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <Pressable
                        style={[
                            styles.modalBackgroundContainer,
                            {
                                backgroundColor: isDark ? "rgba(0, 0, 0, 0.78)" : "rgba(0, 0, 0, 0.4)",
                                paddingBottom: isKeyboardVisible ? 20 : 0
                            }
                        ]}
                        onPress={() => {
                            Keyboard.dismiss()
                            if (closeOnOverlayPress) {
                                onClose()
                            }
                        }}
                    >
                        <Pressable
                            style={[
                                styles.contentContainer,
                                { backgroundColor: 'transparent', padding: 0, width: 'auto' }
                            ]}
                            onPress={() => { }}
                        >
                            {children}
                        </Pressable>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    modalBackgroundContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
    }
})

export default React.memo(StyledModal)
