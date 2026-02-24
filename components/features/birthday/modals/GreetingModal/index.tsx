import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    Share,
    TouchableOpacity,
    View
} from "react-native";
import ViewShot from "react-native-view-shot";
import DrawingModal from "../DrawingModal";
import BirthdayCardPreview, { BirthdayBackgroundHandle } from "./BirthdayCardPreview";
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

const BACKGROUND_OPTIONS: { id: BirthdayBackgroundHandle; color: string }[] = [
    { id: 'v1', color: '#1A1A1A' }, // Dark/Black
    { id: 'v2', color: '#1B4D3E' }, // Dark Green
    { id: 'v3', color: '#4d1b1eff' }, // Dark Red
];

type TabType = 'text' | 'card' | 'draw';

const GreetingModal: React.FC<GreetingModalProps> = ({
    isOpen,
    onClose,
    onSend,
    personName,
}) => {
    const { t, colors, isDark } = useTheme();
    const BIRTHDAY_PRIMARY = colors.PRIMARY_ACTIVE_BUTTON;
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [activeTab, setActiveTab] = useState<TabType>('text');
    const [selectedMessage, setSelectedMessage] = useState<string>("");
    const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
    const [selectedBackground, setSelectedBackground] = useState<BirthdayBackgroundHandle>('v1');
    const cardRef = useRef<ViewShot>(null);

    // Initial message from list if empty
    useEffect(() => {
        if (!selectedMessage && isOpen) {
            setSelectedMessage(t(GREETING_KEYS[0] as any));
        }
    }, [isOpen]);

    const handleTabChange = (tab: TabType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
    };

    const handleShare = async () => {
        try {
            let sharedMessage = selectedMessage;
            let shareSuccess = false;

            const isMessagingOrSocial = (type: string) => {
                const lower = type.toLowerCase();
                const allowedKeywords = [
                    'whatsapp', 'telegram', 'instagram', 'messenger',
                    'viber', 'signal', 'snapchat', 'discord',
                    'message', 'mail', 'facebook', 'twitter', 'slack'
                ];
                return allowedKeywords.some(keyword => lower.includes(keyword));
            };

            if (activeTab === 'card') {
                const uri = await cardRef.current?.capture?.();
                if (uri) {
                    if (Platform.OS === 'ios') {
                        const result = await Share.share({
                            url: uri,
                            message: t("birthday_happy_birthday")
                        });
                        if (result.action === Share.sharedAction && result.activityType) {
                            if (isMessagingOrSocial(result.activityType)) {
                                sharedMessage = "[Card]";
                                shareSuccess = true;
                            }
                        }
                    } else {
                        await Sharing.shareAsync(uri);
                        sharedMessage = "[Card]";
                        shareSuccess = true;
                    }
                }
            } else {
                const result = await Share.share({ message: selectedMessage });
                if (result.action === Share.sharedAction) {
                    if (Platform.OS === 'ios' && result.activityType) {
                        if (isMessagingOrSocial(result.activityType)) {
                            shareSuccess = true;
                        }
                    } else {
                        shareSuccess = true;
                    }
                }
            }

            if (shareSuccess) {
                finalizeSend(sharedMessage);
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

                {/* Tabs */}
                <View style={styles.tabsRow}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'text' && styles.activeTab]}
                        onPress={() => handleTabChange('text')}
                    >
                        <Ionicons name="chatbubble-outline" size={16} color={activeTab === 'text' ? '#FFF' : colors.SECTION_TEXT} />
                        <StyledText style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>{t("tab_text")}</StyledText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'card' && styles.activeTab]}
                        onPress={() => handleTabChange('card')}
                    >
                        <Ionicons name="image-outline" size={16} color={activeTab === 'card' ? '#FFF' : colors.SECTION_TEXT} />
                        <StyledText style={[styles.tabText, activeTab === 'card' && styles.activeTabText]}>{t("tab_design_card")}</StyledText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'draw' && styles.activeTab]}
                        onPress={() => handleTabChange('draw')}
                    >
                        <Ionicons name="brush-outline" size={16} color={activeTab === 'draw' ? '#FFF' : colors.SECTION_TEXT} />
                        <StyledText style={[styles.tabText, activeTab === 'draw' && styles.activeTabText]}>{t("tab_handwritten")}</StyledText>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    {activeTab === 'text' && (
                        <ScrollView
                            style={styles.greetingsScroll}
                            contentContainerStyle={styles.greetingsContent}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {GREETING_KEYS.map((key) => {
                                const msg = t(key as any);
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[styles.greetingCard, selectedMessage === msg && styles.selectedGreeting]}
                                        onPress={() => {
                                            setSelectedMessage(msg);
                                        }}
                                    >
                                        <StyledText style={styles.greetingText}>{msg}</StyledText>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    {activeTab === 'card' && (
                        <View style={[styles.greetingsScroll, { borderRightWidth: 0, height: 240, justifyContent: 'center' }]}>
                            <View style={styles.cardPreviewContainer}>
                                <View style={styles.cardRow}>
                                    {/* Left: Side Background Selector */}
                                    <View style={styles.sideSelector}>
                                        {BACKGROUND_OPTIONS.map((bg) => {
                                            const isSelected = selectedBackground === bg.id;
                                            return (
                                                <TouchableOpacity
                                                    key={bg.id}
                                                    style={[styles.bgOptionBtn, isSelected && styles.bgOptionActive]}
                                                    onPress={() => {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                        setSelectedBackground(bg.id);
                                                    }}
                                                >
                                                    <View style={[styles.bgOptionInner, { backgroundColor: bg.color }]} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Middle: Preview */}
                                    <View pointerEvents="none" style={{ flex: 1, alignItems: 'center' }}>
                                        <BirthdayCardPreview
                                            ref={cardRef}
                                            message={selectedMessage}
                                            backgroundHandle={selectedBackground}
                                        />
                                    </View>

                                    {/* Right: Side Number Selector */}
                                    <View style={styles.sideNumberSelector}>
                                        {GREETING_KEYS.map((key, index) => {
                                            const msg = t(key as any);
                                            const isSelected = selectedMessage === msg;
                                            return (
                                                <TouchableOpacity
                                                    key={key}
                                                    style={[styles.numberBtn, isSelected && styles.numberBtnActive]}
                                                    onPress={() => {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                        setSelectedMessage(msg);
                                                    }}
                                                >
                                                    <StyledText style={[styles.numberBtnText, isSelected && styles.numberBtnTextActive]}>
                                                        {index + 1}
                                                    </StyledText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}



                    {activeTab === 'draw' && (
                        <View style={styles.handwrittenContainer}>
                            <TouchableOpacity style={styles.drawHeroButton} onPress={() => setIsDrawingModalOpen(true)}>
                                <Ionicons name="brush-outline" size={40} color={BIRTHDAY_PRIMARY} />
                                <StyledText style={styles.drawHeroText}>{t("birthday_draw_button")}</StyledText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    {activeTab !== 'draw' && (
                        <StyledButton
                            label="Göndər"
                            onPress={handleShare}
                            variant="dark_button"
                        />
                    )}
                </View>
            </View>

            <DrawingModal
                isOpen={isDrawingModalOpen}
                onClose={() => setIsDrawingModalOpen(false)}
                onSend={() => onSend("[Handwritten Greeting]")}
            />
        </StyledModal>
    );
};

export default React.memo(GreetingModal);
