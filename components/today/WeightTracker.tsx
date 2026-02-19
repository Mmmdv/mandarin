import { toggleAnimation } from '@/constants/animations';
import { styles as homeStyles } from '@/constants/homeStyles';
import { useTheme } from '@/hooks/useTheme';
import { resetWeight, selectDayData, selectLastWeight, selectPreviousWeight, setWeight } from '@/store/slices/todaySlice';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, LayoutAnimation, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import StyledText from '../StyledText';

const ITEM_WIDTH = 15; // Slightly wider for easier interaction
const START_WEIGHT = 40;
const END_WEIGHT = 180;

const WEIGHT_DATA = Array.from({ length: (END_WEIGHT - START_WEIGHT) * 10 + 1 }, (_, i) => ({
    value: parseFloat((START_WEIGHT + i * 0.1).toFixed(1)),
    isMajor: i % 10 === 0,
    isMedium: i % 5 === 0 && i % 10 !== 0
}));

export default function WeightTracker() {
    const { colors, t } = useTheme();
    const dispatch = useDispatch();
    const today = new Date().toISOString().split('T')[0];
    const dayData: any = useSelector(selectDayData(today));
    const lastWeight = useSelector(selectLastWeight);
    const previousWeight = useSelector(selectPreviousWeight(today));
    const flatListRef = useRef<FlatList>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(dayData?.weight ? 1 : 0)).current;

    const initialWeight = lastWeight || 70;
    const [localWeight, setLocalWeight] = useState<number>(dayData?.weight || initialWeight);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const expandAnim = useRef(new Animated.Value(0)).current;

    const toggleExpanded = () => {
        setIsExpanded(prev => {
            const newValue = !prev;
            Animated.timing(expandAnim, {
                toValue: newValue ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            LayoutAnimation.configureNext(toggleAnimation);
            return newValue;
        });
    };

    const getRotation = () => expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg']
    });

    const getCircleTransform = () => ({
        transform: [
            { translateX: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
            { translateY: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
            { scale: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }
        ],
        opacity: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] })
    });

    const currentWeight = dayData?.weight;

    const getWeightComparison = () => {
        if (!currentWeight || !previousWeight) return null;
        const diff = parseFloat((currentWeight - previousWeight).toFixed(1));

        if (diff < 0) return {
            color: '#10B981', // Green
            icon: 'trending-down' as any,
            label: Math.abs(diff) >= 1 ? 'mood_excellent' : 'mood_feedback_positive',
            haptic: Haptics.NotificationFeedbackType.Success,
            diff: diff.toFixed(1)
        };
        if (diff === 0) return {
            color: '#3B82F6', // Blue
            icon: 'remove' as any,
            label: 'mood_q1',
            haptic: Haptics.ImpactFeedbackStyle.Medium,
            diff: '0'
        };
        return {
            color: '#FF4757', // Red
            icon: 'trending-up' as any,
            label: diff >= 1 ? 'mood_bad' : 'mood_feedback_negative',
            haptic: Haptics.NotificationFeedbackType.Error,
            diff: `+${diff.toFixed(1)}`
        };
    };

    const scrollToWeight = (weight: number, animated = false) => {
        if (flatListRef.current && containerWidth > 0) {
            const index = WEIGHT_DATA.findIndex(d => d.value === weight);
            if (index !== -1) {
                flatListRef.current.scrollToOffset({
                    offset: index * ITEM_WIDTH,
                    animated
                });
            }
        }
    };

    useEffect(() => {
        if (!currentWeight && containerWidth > 0 && isExpanded) {
            scrollToWeight(localWeight, false);
        }
    }, [containerWidth, currentWeight, isExpanded]);

    const startSelectedAnimation = () => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ]).start();
    };

    useEffect(() => {
        if (currentWeight) {
            startSelectedAnimation();
        }
    }, [!!currentWeight]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / ITEM_WIDTH);
        if (index >= 0 && index < WEIGHT_DATA.length) {
            const val = WEIGHT_DATA[index].value;
            if (val !== localWeight) {
                setLocalWeight(val);
                Haptics.selectionAsync();
            }
        }
    };

    const handleConfirm = async () => {
        dispatch(setWeight({ date: today, weight: localWeight }));

        // Triger haptics based on comparison
        const diff = previousWeight ? localWeight - previousWeight : 0;
        if (diff < 0) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (diff > 0) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        startSelectedAnimation();
    };

    const handleReset = () => {
        // Test rejimi: Cari seçimi dünənə yaz və bugünü təmizlə
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        // Mevcut deyeri dünən kimi yadda saxla
        dispatch(setWeight({ date: yesterdayStr, weight: localWeight }));

        // Bu günü təmizlə
        dispatch(resetWeight({ date: today }));

        fadeAnim.setValue(0);

        // Xətkeşi sinxronizasiya et
        setTimeout(() => {
            scrollToWeight(localWeight, true);
        }, 100);
    };

    const comp = getWeightComparison();

    const containerColor = comp?.color || '#10B981';

    return (
        <View style={{ marginBottom: 2.5, marginTop: 3 }}>
            <Pressable
                onPress={toggleExpanded}
                style={[
                    homeStyles.card,
                    {
                        backgroundColor: 'rgba(100, 116, 139, 0.15)',
                        borderWidth: 0.3,
                        borderColor: 'rgba(100, 116, 139, 0.3)',
                        borderRadius: 20,
                        paddingVertical: 13,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        overflow: 'hidden',
                        marginBottom: 0,
                        marginTop: 0,
                        width: '100%'
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${comp?.color || '#10B981'}55`, zIndex: 2 }]}>
                    <Ionicons name="barbell" size={17} color={colors.SECTION_TEXT} />
                </View>
                <StyledText
                    style={[homeStyles.cardTitle, { color: colors.SECTION_TEXT, fontSize: 14, flex: 1, marginBottom: 0, zIndex: 2 }]}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                >
                    {t('today_weight')}
                </StyledText>
                {currentWeight && (
                    <Pressable onPress={handleReset} style={[styles.headerButton, { zIndex: 2 }]}>
                        <Ionicons name="refresh" size={18} color={colors.PLACEHOLDER} />
                    </Pressable>
                )}
                <View style={{ width: 24, alignItems: 'flex-end', justifyContent: 'center', zIndex: 2 }}>
                    <Animated.View style={{ transform: [{ rotate: getRotation() }] }}>
                        <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT} />
                    </Animated.View>
                </View>
                <Animated.View
                    style={[
                        homeStyles.decorativeCircle,
                        {
                            backgroundColor: comp?.color ? `${comp.color}3A` : 'rgba(16, 185, 129, 0.25)',
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            bottom: -20,
                            right: -20
                        },
                        getCircleTransform()
                    ]}
                    pointerEvents="none"
                />
            </Pressable>

            {isExpanded && (
                <View style={{
                    marginTop: 10,
                    backgroundColor: 'rgba(100, 116, 139, 0.15)',
                    borderWidth: 0.3,
                    borderColor: 'rgba(100, 116, 139, 0.3)',
                    borderRadius: 20,
                    padding: 20,
                    minHeight: 100,
                    justifyContent: 'center'
                }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {!currentWeight ? (
                            <View style={styles.contentContainer}>
                                <View
                                    style={styles.rulerContainer}
                                    onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                                >
                                    <View style={[styles.pointer, { backgroundColor: '#10B981' }]} />
                                    <FlatList
                                        ref={flatListRef}
                                        data={WEIGHT_DATA}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        snapToInterval={ITEM_WIDTH}
                                        decelerationRate="fast"
                                        onScroll={handleScroll}
                                        scrollEventThrottle={16}
                                        getItemLayout={(_, index) => ({
                                            length: ITEM_WIDTH,
                                            offset: ITEM_WIDTH * index,
                                            index,
                                        })}
                                        contentContainerStyle={{
                                            paddingHorizontal: containerWidth / 2,
                                        }}
                                        keyExtractor={(item) => item.value.toString()}
                                        renderItem={({ item }) => (
                                            <View style={[styles.tickContainer, { width: ITEM_WIDTH }]}>
                                                <View
                                                    style={[
                                                        styles.tick,
                                                        {
                                                            backgroundColor: colors.PRIMARY_BORDER,
                                                            height: item.isMajor ? 32 : item.isMedium ? 22 : 14,
                                                            width: item.isMajor ? 2.5 : 1.5,
                                                            opacity: item.isMajor ? 1 : 0.4
                                                        }
                                                    ]}
                                                />
                                                {item.isMajor && (
                                                    <StyledText style={[styles.tickLabel, { color: colors.PLACEHOLDER }]}>
                                                        {item.value}
                                                    </StyledText>
                                                )}
                                            </View>
                                        )}
                                    />
                                </View>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.confirmButton,
                                        {
                                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                            transform: [{ scale: pressed ? 0.96 : 1 }],
                                            opacity: pressed ? 0.9 : 1
                                        }
                                    ]}
                                    onPress={handleConfirm}
                                >
                                    <StyledText style={[styles.buttonText, { color: '#10B981' }]}>
                                        {localWeight.toFixed(1)} <StyledText style={[styles.buttonUnit, { color: '#10B981', opacity: 0.8 }]}>kg</StyledText>
                                    </StyledText>
                                    <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8 }} />
                                </Pressable>
                            </View>
                        ) : (
                            <Animated.View style={[styles.selectedContainer, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
                                <View style={styles.weightValueRow}>
                                    <StyledText style={[styles.selectedValue, { color: comp?.color || colors.PRIMARY_TEXT }]}>
                                        {currentWeight}
                                    </StyledText>
                                    <StyledText style={[styles.unit, { color: colors.PLACEHOLDER }]}>kg</StyledText>
                                </View>

                                {comp && (
                                    <View style={[styles.feedbackBadge, { backgroundColor: `${comp.color}15` }]}>
                                        <Ionicons name={comp.icon} size={14} color={comp.color} />
                                        <StyledText style={[styles.diffText, { color: comp.color }]}>
                                            {comp.diff} kg
                                        </StyledText>
                                    </View>
                                )}
                            </Animated.View>
                        )}
                    </View>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        marginTop: 10,
    },
    rulerContainer: {
        height: 65,
        position: 'relative',
        justifyContent: 'center',
    },
    pointer: {
        position: 'absolute',
        top: 0,
        left: '50%',
        width: 3.5,
        height: 45,
        zIndex: 10,
        borderRadius: 2,
        marginLeft: -1.75,
    },
    tickContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 60,
    },
    tick: {
        borderRadius: 1.5,
    },
    tickLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 6,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
        marginBottom: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonUnit: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    selectedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    weightValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    selectedValue: {
        fontSize: 48,
        fontWeight: '900',
    },
    unit: {
        fontSize: 20,
        marginLeft: 6,
        fontWeight: '600',
        opacity: 0.7,
    },
    feedbackBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: -5,
    },
    diffText: {
        fontSize: 14,
        fontWeight: '700',
    },
    headerButton: {
        padding: 6,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
