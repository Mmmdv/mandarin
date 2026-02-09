import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { COLORS } from "@/constants/ui";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

type ViewTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    title: Todo["title"]
    createdAt: Todo["createdAt"]
    updatedAt?: Todo["updatedAt"]
    completedAt?: Todo["completedAt"]
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeStr = date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
    return `${dateStr} ${timeStr}`
}

const ViewTodoModal: React.FC<ViewTodoModalProps> = ({
    isOpen,
    onClose,
    title,
    createdAt,
    updatedAt,
    completedAt,
}) => {

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-done-circle" size={28} color="#4ECDC4" />
                </View>

                <StyledText style={styles.headerText}>Task Details</StyledText>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <StyledText style={styles.label}>Title</StyledText>
                        <StyledText style={styles.value}>{title}</StyledText>
                    </View>

                    <View style={styles.detailRow}>
                        <StyledText style={styles.label}>🕐 Created</StyledText>
                        <StyledText style={styles.value}>{formatDate(createdAt)}</StyledText>
                    </View>

                    {updatedAt && (
                        <View style={styles.detailRow}>
                            <StyledText style={styles.label}>✏️ Edited</StyledText>
                            <StyledText style={[styles.value, { color: '#5BC0EB' }]}>
                                {formatDate(updatedAt)}
                            </StyledText>
                        </View>
                    )}

                    {completedAt && (
                        <View style={styles.detailRow}>
                            <StyledText style={styles.label}>✅ Completed</StyledText>
                            <StyledText style={[styles.value, { color: '#4ECDC4' }]}>
                                {formatDate(completedAt)}
                            </StyledText>
                        </View>
                    )}
                </View>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label="Close"
                        onPress={onClose}
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
        minWidth: 300,
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(78, 205, 196, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
    },
    divider: {
        height: 0.5,
        backgroundColor: "#3a3f47",
        width: "100%",
    },
    detailsContainer: {
        width: "100%",
        gap: 12,
    },
    detailRow: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        color: "#888",
    },
    value: {
        fontSize: 14,
        color: COLORS.PRIMARY_TEXT,
    },
    buttonsContainer: {
        marginTop: 8,
    },
})

export default ViewTodoModal
