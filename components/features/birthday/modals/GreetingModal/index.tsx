import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    Share,
    TouchableOpacity,
    View
} from "react-native";
import { getStyles } from "./styles";

// ─── Modal Implementation ───

type GreetingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
    personName: string;
};

const GREETING_KEYS = [
    "birthday_greeting_1",
    "birthday_greeting_2",
    "birthday_greeting_3",
    "birthday_greeting_4",
    "birthday_greeting_5",
] as const;

const GreetingModal: React.FC<GreetingModalProps> = ({
    isOpen,
    onClose,
    onSend,
    personName,
}) => {
    const { t, colors, isDark } = useTheme();
    const BIRTHDAY_PRIMARY = colors.PRIMARY_ACTIVE_BUTTON;
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [selectedMessage, setSelectedMessage] = useState<string>("");

    // Initial message from list if empty
    useEffect(() => {
        if (!selectedMessage && isOpen) {
            setSelectedMessage(t(GREETING_KEYS[0] as any));
        }
    }, [isOpen]);

    const handleShare = async () => {
        try {
            const isMessagingOrSocial = (type: string) => {
                const lower = type.toLowerCase();
                const allowedKeywords = [
                    'whatsapp', 'telegram', 'instagram', 'messenger',
                    'viber', 'signal', 'snapchat', 'discord',
                    'message', 'mail', 'facebook', 'twitter', 'slack'
                ];
                return allowedKeywords.some(keyword => lower.includes(keyword));
            };

            const result = await Share.share({ message: selectedMessage });

            if (result.action === Share.sharedAction) {
                if (Platform.OS === 'ios' && result.activityType) {
                    if (isMessagingOrSocial(result.activityType)) {
                        finalizeSend(selectedMessage);
                    }
                } else {
                    // Android or iOS without specific activityType (user might have just copied or similar)
                    // Usually we treat standard Share.sharedAction as success on Android
                    finalizeSend(selectedMessage);
                }
            }
        } catch (e) {
            console.error("Share error:", e);
        }
    };

    const finalizeSend = (message: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSend(message);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.container}>
                <View style={[
                    modalStyles.iconContainer,
                    {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        shadowColor: BIRTHDAY_PRIMARY,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2
                    }]}>
                    <Ionicons name="paper-plane" size={28} color={BIRTHDAY_PRIMARY} />
                </View>

                <StyledText style={styles.headerText}>{t("birthday_send_greeting")}</StyledText>
                <View style={modalStyles.divider} />

                <View style={styles.recipientCard}>
                    <View style={[styles.recipientAvatar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                        <Ionicons name="gift" size={20} color={colors.SECTION_TEXT} />
                    </View>
                    <View style={styles.recipientInfo}>
                        <StyledText style={[styles.recipientLabel, { color: colors.PLACEHOLDER }]}>{t("birthday_recipient_label")}</StyledText>
                        <StyledText style={styles.recipientName}>{personName}</StyledText>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    <ScrollView
                        style={styles.greetingsScroll}
                        contentContainerStyle={styles.greetingsContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {GREETING_KEYS.map((key) => {
                            const msg = t(key as any);
                            const isSelected = selectedMessage === msg;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.greetingCard,
                                        isSelected && styles.selectedGreeting
                                    ]}
                                    onPress={() => {
                                        setSelectedMessage(msg);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <StyledText style={[
                                        styles.greetingText,
                                        isSelected && { color: colors.PRIMARY_TEXT, fontWeight: '600' }
                                    ]}>
                                        {msg}
                                    </StyledText>
                                    {isSelected && (
                                        <View style={styles.selectedIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} color={BIRTHDAY_PRIMARY} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Footer */}
                <View style={[modalStyles.buttonsContainer, { marginTop: 6 }]}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label="Göndər"
                        onPress={handleShare}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default React.memo(GreetingModal);

