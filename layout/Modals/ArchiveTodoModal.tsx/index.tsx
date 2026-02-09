import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { COLORS } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

type ArchiveTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onArchive: () => void
};

const ArchiveTodoModal: React.FC<ArchiveTodoModalProps> = ({
    isOpen,
    onClose,
    onArchive,
}) => {

    const handleArchive = () => {
        onArchive()
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="archive-outline" size={28} color="#888" />
                </View>

                <StyledText style={styles.headerText}>Archive Task?</StyledText>

                <StyledText style={styles.messageText}>
                    This task will be moved to archive.
                </StyledText>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label="Cancel"
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label="Archive"
                        onPress={handleArchive}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: "#3a3f47",
        padding: 20,
        minWidth: 280,
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(136, 136, 136, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
    },
    messageText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
    },
})

export default ArchiveTodoModal
