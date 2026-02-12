import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import ApplicationSection from "./sections/ApplicationSection";
import LanguageSection from "./sections/LanguageSection";
import NotificationSection from "./sections/NotificationSection";
import ThemeSection from "./sections/ThemeSection";
import { styles } from "./styles";

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
    const { colors, t } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={() => { }}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: colors.PRIMARY_BORDER_DARK }]}>
                    <View style={styles.header}>
                        <StyledText style={[styles.title, { color: colors.PRIMARY_TEXT }]}>
                            {t("settings")}
                        </StyledText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.PRIMARY_TEXT} />
                        </TouchableOpacity>
                    </View>

                    <LanguageSection />
                    <ThemeSection />
                    <NotificationSection visible={visible} />
                    <ApplicationSection />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default SettingsModal;
