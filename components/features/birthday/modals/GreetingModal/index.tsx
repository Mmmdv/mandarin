import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    Share,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getStyles } from "./styles";

// ─── Əsas səhifədəki birthday kartına uyğun rəng paleti ───
const BIRTHDAY_PRIMARY = "#D4880F";

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
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [customMessage, setCustomMessage] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const displayName = personName;

    const handleShareAndSend = async (message: string, index: number) => {
        try {
            setCopiedIndex(index);
            const result = await Share.share({ message });

            if (result.action === Share.sharedAction) {
                let isAllowedApp = true;

                // iOS-da hansı tətbiqin seçildiyini yoxlaya bilirik
                if (Platform.OS === 'ios' && result.activityType) {
                    const messengerApps = [
                        'com.apple.UIKit.activity.Message', // iMessage / SMS
                        'com.apple.UIKit.activity.PostToTwitter', // Twitter
                        'net.whatsapp.WhatsApp.ShareExtension', // WhatsApp
                        'ph.telegra.Telegraph.Share', // Telegram
                        'org.telegram.Telegram-iOS.Share', // Telegram (alt)
                        'com.facebook.Messenger.ShareExtension', // Facebook Messenger
                        'com.apple.UIKit.activity.PostToFacebook', // Facebook
                        'com.google.chat.share-extension', // Google Chat
                    ];
                    isAllowedApp = messengerApps.some(app => result.activityType?.includes(app));
                }
                // Qeyd: Android platforması gizlilik səbəbi ilə hansı tətbiqin seçildiyi məlumatını tətbiqə ötürmür.
                // Bu səbəbdən Android-də istənilən paylaşım (Waze daxil) uğurlu sayılacaq.

                if (isAllowedApp) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onSend(message);
                    setTimeout(() => {
                        setCopiedIndex(null);
                        onClose();
                    }, 500);
                } else {
                    // Paylaşım edildi, amma seçilən tətbiq (məs: Waze) təbrik tətbiqi sayılmadı
                    setCopiedIndex(null);
                }
            } else {
                // İstifadəçi paylaşımı ləğv etdi
                setCopiedIndex(null);
            }
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
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
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
                    <Ionicons name="paper-plane-outline" size={28} color={BIRTHDAY_PRIMARY} />
                </View>

                <StyledText style={styles.headerText}>
                    {t("birthday_select_greeting")}
                </StyledText>

                <View style={modalStyles.divider} />

                <View style={[
                    styles.recipientCard,
                    {
                        backgroundColor: isDark ? 'rgba(212, 136, 15, 0.08)' : 'rgba(212, 136, 15, 0.05)',
                        borderColor: isDark ? 'rgba(212, 136, 15, 0.3)' : 'rgba(212, 136, 15, 0.2)',
                    }
                ]}>
                    <View style={[
                        styles.recipientAvatar,
                        { backgroundColor: isDark ? 'rgba(212, 136, 15, 0.2)' : 'rgba(212, 136, 15, 0.1)' }
                    ]}>
                        <Ionicons name="gift" size={24} color={BIRTHDAY_PRIMARY} />
                    </View>
                    <View style={styles.recipientInfo}>
                        <StyledText style={[styles.recipientLabel, { color: BIRTHDAY_PRIMARY }]}>
                            {t("birthday_recipient_label")}
                        </StyledText>
                        <StyledText style={[styles.recipientName, { color: colors.PRIMARY_TEXT }]}>
                            {personName}
                        </StyledText>
                    </View>
                </View>

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
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    borderColor: copiedIndex === index
                                        ? "#4ECDC4"
                                        : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            onPress={() => handleShareAndSend(t(key as any), index)}
                            activeOpacity={0.7}
                        >
                            <StyledText
                                style={[styles.greetingText, { color: colors.PRIMARY_TEXT }]}
                                numberOfLines={4}
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
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
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
                                <Ionicons name="send" size={20} color={BIRTHDAY_PRIMARY} />
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                <View style={[modalStyles.buttonsContainer, { justifyContent: "center", marginTop: 8 }]}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default React.memo(GreetingModal);
