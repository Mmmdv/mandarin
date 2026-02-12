import { COLORS } from "@/constants/ui"
import React, { useEffect, useState } from "react"
import { Keyboard, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, UIManager } from "react-native"

type StyledModalProps = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

const StyledModal: React.FC<StyledModalProps> = ({ isOpen, onClose, children }) => {
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
                            { paddingBottom: isKeyboardVisible ? 20 : 0 }
                        ]}
                        onPress={() => {
                            Keyboard.dismiss()
                            // onClose() 
                        }}
                    >
                        <Pressable style={styles.contentContainer} onPress={() => { }}>
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
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        justifyContent: "center", // Align to center
        alignItems: "center",
    },
    contentContainer: {
        backgroundColor: COLORS.PRIMARY_BACKGROUND,
        padding: 20,
        borderRadius: 10,
        width: "90%",
    }
})

export default React.memo(StyledModal)
