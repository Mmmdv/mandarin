import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    Share,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getStyles } from "./styles";

// ─── Əsas səhifədəki birthday kartına uyğun rəng paleti ───
const BIRTHDAY_PRIMARY = "#9D6506";
const BIRTHDAY_LIGHT = "#D4880F";

type GreetingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
    personName: string;
    nickname?: string;
};

const GREETING_KEYS = [
    "birthday_greeting_1",
    "birthday_greeting_2",
    "birthday_greeting_3",
    "birthday_greeting_4",
    "birthday_greeting_5",
] as const;

const GREETING_EMOJIS = ["🎉", "🎈", "🥳", "🎊", "❤️"];

const GreetingModal: React.FC<GreetingModalProps> = ({
    isOpen,
    onClose,
    onSend,
    personName,
    nickname,
}) => {
    const { t, colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [customMessage, setCustomMessage] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const displayName = nickname ? `${nickname} ${personName}` : personName;

    const handleShareAndSend = async (message: string, index: number) => {
        try {
            setCopiedIndex(index);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await Share.share({ message });
            onSend(message);
            setTimeout(() => {
                setCopiedIndex(null);
                onClose();
            }, 500);
        } catch (e) {
            setCopiedIndex(null);
        }
    };

    const handleCustomSend = () => {
        if (customMessage.trim()) {
            handleShareAndSend(customMessage, -1);
            setCustomMessage("");
        }
    };

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.container}>
                <View
                    style={[
                        modalStyles.iconContainer,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            shadowColor: BIRTHDAY_PRIMARY,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 2
                        },
                    ]}
                >
                    <StyledText style={{ fontSize: 28 }}>🎂</StyledText>
                </View>

                <StyledText style={styles.headerText}>
                    {t("birthday_select_greeting")}
                </StyledText>

                <StyledText
                    style={[styles.messageText, { fontWeight: "600", color: BIRTHDAY_LIGHT }]}
                >
                    {displayName}
                </StyledText>

                <View style={modalStyles.divider} />

                <ScrollView
                    style={styles.greetingsScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {GREETING_KEYS.map((key, index) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.greetingCard,
                                {
                                    backgroundColor: colors.PRIMARY_BACKGROUND,
                                    borderColor: copiedIndex === index
                                        ? "#4ECDC4"
                                        : colors.PRIMARY_BORDER_DARK,
                                },
                            ]}
                            onPress={() => handleShareAndSend(t(key as any), index)}
                            activeOpacity={0.7}
                        >
                            <StyledText style={styles.greetingEmoji}>
                                {GREETING_EMOJIS[index]}
                            </StyledText>
                            <StyledText
                                style={[styles.greetingText, { color: colors.PRIMARY_TEXT }]}
                                numberOfLines={3}
                            >
                                {t(key as any)}
                            </StyledText>
                            <View style={styles.copyIcon}>
                                <Ionicons
                                    name={copiedIndex === index ? "checkmark-circle" : "share-outline"}
                                    size={18}
                                    color={copiedIndex === index ? "#4ECDC4" : colors.SECTION_TEXT}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Custom greeting */}
                    <View
                        style={[
                            styles.customContainer,
                            {
                                backgroundColor: colors.PRIMARY_BACKGROUND,
                                borderColor: colors.PRIMARY_BORDER_DARK,
                            },
                        ]}
                    >
                        <TextInput
                            style={[styles.customInput, { color: colors.PRIMARY_TEXT }]}
                            placeholder={t("birthday_greeting_custom")}
                            placeholderTextColor={colors.PLACEHOLDER}
                            value={customMessage}
                            onChangeText={setCustomMessage}
                            multiline
                            numberOfLines={3}
                        />
                        {customMessage.trim() !== "" && (
                            <TouchableOpacity
                                onPress={handleCustomSend}
                                style={styles.sendButton}
                            >
                                <Ionicons name="send" size={20} color={BIRTHDAY_LIGHT} />
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, { borderColor: colors.PRIMARY_BORDER_DARK }]}
                >
                    <StyledText style={[styles.closeText, { color: colors.SECTION_TEXT }]}>
                        {t("close")}
                    </StyledText>
                </TouchableOpacity>
            </View>
        </StyledModal>
    );
};

export default React.memo(GreetingModal);
