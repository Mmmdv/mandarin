import { COLORS } from "@/constants/ui"
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet } from "react-native"

type StyledModalProps = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

const StyledModal: React.FC<StyledModalProps> = ({ isOpen, onClose, children }) => {
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
                        style={styles.modalBackgroundContainer}
                        onPress={() => {
                            Keyboard.dismiss()
                            onClose()
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
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        backgroundColor: COLORS.PRIMARY_BACKGROUND,
        padding: 20,
        borderRadius: 10,
        width: "80%",
    }
})

export default StyledModal
