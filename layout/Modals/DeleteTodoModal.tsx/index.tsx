import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { COLORS } from "@/constants/ui";
import { StyleSheet, View } from "react-native";

type DeleteTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onDelete: () => void
};

const DeleteTodoModal: React.FC<DeleteTodoModalProps> = ({
    isOpen,
    onClose,
    onDelete }) => {

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContentContainer}>
                    <StyledText variant="heading">Delete to do task</StyledText>
                    <StyledText variant="modal_question">Are you sure you want to delete this to do task?</StyledText>
                </View>
                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label="Cancel"
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label="Delete"
                        onPress={onDelete}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

const styles = StyleSheet.create({
    modalContentContainer: {
        gap: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        paddingVertical: 40,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: "#3a3f47",
    },
    buttonsContainer: {
        flexDirection: "row",
        marginTop: 20,
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
    }
})

export default DeleteTodoModal
