import StyledButton from "@/components/ui/StyledButton";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Sharing from 'expo-sharing';
import React, { useMemo, useRef, useState } from "react";
import {
    ImageBackground,
    Modal,
    Pressable,
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

const BACKGROUND_OPTIONS: { id: BirthdayBackgroundHandle; source: any }[] = [
    { id: 'v1', source: require("@/assets/images/Birthday/birthday_background_v1.webp") },
    { id: 'v2', source: require("@/assets/images/Birthday/birthday_background_v2.webp") },
    { id: 'v3', source: require("@/assets/images/Birthday/birthday_background_v3.webp") },
    { id: 'v4', source: require("@/assets/images/Birthday/birthday_background_v4.webp") },
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
    useMemo(() => {
        if (!selectedMessage) setSelectedMessage(t(GREETING_KEYS[0] as any));
    }, []);

    const handleTabChange = (tab: TabType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
    };

    const handleShare = async () => {
        const messageToSend = selectedMessage;

        try {
            if (activeTab === 'card') {
                const uri = await cardRef.current?.capture?.();
                if (uri) {
                    const isAvailable = await Sharing.isAvailableAsync();
                    if (isAvailable) {
                        await Sharing.shareAsync(uri);
                        finalizeSend("[Card]");
                        return;
                    }
                }
            }

            // Default text share
            const result = await Share.share({ message: messageToSend });
            if (result.action === Share.sharedAction) {
                finalizeSend(messageToSend);
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
        <Modal transparent visible={isOpen} animationType="fade">
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose}>
                <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.headerWrapper}>
                        <StyledText style={styles.headerText}>{t("birthday_select_greeting")}</StyledText>
                    </View>

                    <View style={styles.recipientCard}>
                        <View style={[styles.recipientAvatar, { backgroundColor: isDark ? 'rgba(212, 136, 15, 0.2)' : 'rgba(212, 136, 15, 0.1)' }]}>
                            <Ionicons name="gift" size={20} color="#D4880F" />
                        </View>
                        <View style={styles.recipientInfo}>
                            <StyledText style={[styles.recipientLabel, { color: "#D4880F" }]}>{t("birthday_recipient_label")}</StyledText>
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
                            <ScrollView style={styles.greetingsScroll} showsVerticalScrollIndicator={false}>
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
                                            <Ionicons
                                                name={selectedMessage === msg ? "radio-button-on" : "radio-button-off"}
                                                size={18}
                                                color={selectedMessage === msg ? BIRTHDAY_PRIMARY : colors.SECTION_TEXT}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}

                        {activeTab === 'card' && (
                            <View style={styles.cardPreviewContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.backgroundSelector}>
                                    <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
                                        {BACKGROUND_OPTIONS.map((bg) => (
                                            <TouchableOpacity
                                                key={bg.id}
                                                style={[styles.bgThumbnail, selectedBackground === bg.id && styles.activeBgThumbnail]}
                                                onPress={() => setSelectedBackground(bg.id)}
                                            >
                                                <ImageBackground source={bg.source} style={styles.bgThumbnailImage} resizeMode="cover" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                                <BirthdayCardPreview
                                    ref={cardRef}
                                    message={selectedMessage}
                                    backgroundHandle={selectedBackground}
                                />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60, width: '100%' }}>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        {GREETING_KEYS.map((key) => {
                                            const msg = t(key as any);
                                            return (
                                                <TouchableOpacity
                                                    key={key}
                                                    style={[
                                                        {
                                                            padding: 8,
                                                            borderRadius: 10,
                                                            borderWidth: 1,
                                                            borderColor: selectedMessage === msg ? BIRTHDAY_PRIMARY : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                            backgroundColor: selectedMessage === msg
                                                                ? (isDark ? 'rgba(35, 78, 148, 0.2)' : 'rgba(35, 78, 148, 0.1)')
                                                                : 'transparent'
                                                        }
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedMessage(msg);
                                                    }}
                                                >
                                                    <StyledText
                                                        style={{
                                                            fontSize: 10,
                                                            maxWidth: 100,
                                                            color: selectedMessage === msg ? BIRTHDAY_PRIMARY : colors.PRIMARY_TEXT
                                                        }}
                                                        numberOfLines={1}
                                                    >
                                                        {msg}
                                                    </StyledText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
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
                    <View style={styles.footer}>
                        {activeTab !== 'draw' && (
                            <StyledButton
                                label={t("birthday_send_greeting")}
                                icon="paper-plane"
                                onPress={handleShare}
                                variant="dark_button"
                                style={{ width: '100%' }}
                            />
                        )}
                        <StyledButton
                            label={t("close")}
                            onPress={onClose}
                            variant="dark_button"
                            style={{ width: '100%' }}
                        />
                    </View>
                </Pressable>
            </Pressable>

            <DrawingModal
                isOpen={isDrawingModalOpen}
                onClose={() => setIsDrawingModalOpen(false)}
                onSend={() => onSend("[Handwritten Greeting]")}
            />
        </Modal>
    );
};

export default React.memo(GreetingModal);
