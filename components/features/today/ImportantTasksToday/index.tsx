import StyledText from '@/components/ui/StyledText';
import { toggleAnimation } from '@/constants/animations';
import { styles as homeStyles } from '@/constants/homeStyles';
import { formatDate } from '@/helpers/date';
import { useTheme } from '@/hooks/useTheme';
import { selectTodos } from '@/store/slices/todoSlice';
import { Todo } from '@/types/todo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, FlatList, LayoutAnimation, Pressable, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { styles } from './styles';

export default function ImportantTasksToday() {
    const { colors, t, lang } = useTheme();
    const todos = useSelector(selectTodos);
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(true);
    const [filter, setFilter] = useState<'all' | 'past' | 'waiting'>('all'); // Filter state
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const expandAnim = useRef(new Animated.Value(1)).current;

    // Generate dates: 3 days past + today + 14 days future
    const dates = useMemo(() => {
        const d = [];
        for (let i = -3; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            d.push({
                full: date.toISOString().split('T')[0],
                day: date.getDate(),
                weekday: date.toLocaleDateString(lang === 'az' ? 'az-AZ' : lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' }),
                isToday: i === 0
            });
        }
        return d;
    }, [lang]);

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

    const selectedTasks = useMemo(() => {
        return todos
            .filter((todo: Todo) => {
                if (!todo.reminder || todo.isCompleted || todo.isArchived) {
                    return false;
                }
                const reminderDate = todo.reminder.split('T')[0];
                return reminderDate === selectedDate;
            })
            .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime());
    }, [todos, selectedDate]);

    const filteredTasks = useMemo(() => {
        const now = new Date();
        if (filter === 'all') return selectedTasks;
        if (filter === 'past') {
            return selectedTasks.filter(task => new Date(task.reminder!) < now);
        }
        if (filter === 'waiting') {
            return selectedTasks.filter(task => new Date(task.reminder!) >= now);
        }
        return selectedTasks;
    }, [selectedTasks, filter]);

    const handleTaskPress = () => {
        router.push('/(tabs)/todo');
    };

    const handleViewAll = () => {
        router.push('/today-tasks');
    };

    const getTimeFromReminder = (reminder: string) => {
        return formatDate(reminder, lang).split(' ')[1];
    };

    const getPriorityColor = (task: Todo) => {
        const isOverdue = task.reminder ? new Date(task.reminder) < new Date() : false;
        return isOverdue ? '#d43434' : '#2cad66';
    };

    return (
        <View style={{ marginBottom: 0, marginTop: 6 }}>
            <Pressable
                onPress={toggleExpanded}
                style={[
                    homeStyles.card,
                    {
                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                        borderWidth: 0.3,
                        borderColor: 'rgba(100, 116, 139, 0.3)',
                        borderRadius: 20,
                        paddingVertical: 13,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        overflow: 'hidden'
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(35, 78, 148, 0.55)', zIndex: 2 }]}>
                    <Ionicons name="notifications" size={17} color={colors.SECTION_TEXT} />
                </View>
                <StyledText style={[homeStyles.cardTitle, { color: colors.SECTION_TEXT, fontSize: 14, marginBottom: 0, zIndex: 2 }]}>
                    {selectedDate === new Date().toISOString().split('T')[0] ? t('today_tasks_header') : t('tasks')}
                </StyledText>
                {selectedTasks.length > 0 && (
                    <View style={[styles.badge, { backgroundColor: 'rgba(35, 78, 148, 0.15)', zIndex: 2 }]}>
                        <StyledText style={[styles.badgeText, { color: colors.SECTION_TEXT }]}>{selectedTasks.length}</StyledText>
                    </View>
                )}
                <View style={{ flex: 1 }} />
                <View style={{ width: 24, alignItems: 'flex-end', justifyContent: 'center', zIndex: 2 }}>
                    <Animated.View style={{ transform: [{ rotate: getRotation() }] }}>
                        <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT} />
                    </Animated.View>
                </View>
                <Animated.View
                    style={[
                        homeStyles.decorativeCircle,
                        {
                            backgroundColor: 'rgba(35, 78, 148, 0.3)',
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
                <View style={{ marginTop: 15 }}>
                    {/* Date Strip */}
                    <View style={{ marginBottom: 15 }}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={dates}
                            keyExtractor={(item) => item.full}
                            initialScrollIndex={2}
                            getItemLayout={(_, index) => ({
                                length: 65, // width (55) + gap (10)
                                offset: 65 * index,
                                index,
                            })}
                            contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
                            renderItem={({ item }) => {
                                const isSelected = selectedDate === item.full;
                                return (
                                    <TouchableOpacity
                                        onPress={() => setSelectedDate(item.full)}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 53,
                                            height: 60,
                                            borderRadius: 18,
                                            backgroundColor: isSelected ? '#234E94' : 'rgba(100, 116, 139, 0.1)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 1,
                                            borderColor: isSelected ? '#234E94' : 'transparent',
                                        }}
                                    >
                                        <StyledText style={{
                                            color: isSelected ? '#fff' : colors.PLACEHOLDER,
                                            fontSize: 10,
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            marginBottom: 4
                                        }}>
                                            {item.weekday}
                                        </StyledText>
                                        <StyledText style={{
                                            color: isSelected ? '#fff' : colors.PRIMARY_TEXT,
                                            fontSize: 18,
                                            fontWeight: 'bold'
                                        }}>
                                            {item.day}
                                        </StyledText>
                                        {item.isToday && !isSelected && (
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 6,
                                                width: 4,
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: '#234E94'
                                            }} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>

                    <View style={{ marginBottom: 10 }}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={[
                                { key: 'all', label: t('all') },
                                { key: 'past', label: t('status_overdue') },
                                { key: 'waiting', label: t('status_pending') },
                            ]}
                            keyExtractor={(item) => item.key}
                            contentContainerStyle={{ gap: 8, flexGrow: 1, justifyContent: 'center' }}
                            renderItem={({ item }) => {
                                const isSelected = filter === item.key;
                                return (
                                    <TouchableOpacity
                                        onPress={() => setFilter(item.key as any)}
                                        style={{
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 16,
                                            backgroundColor: isSelected ? '#234E94' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <StyledText style={{
                                            color: isSelected ? '#fff' : colors.PLACEHOLDER,
                                            fontSize: 12,
                                            fontWeight: isSelected ? '700' : '500',
                                            marginBottom: isSelected ? 4 : 0,
                                        }}>
                                            {item.label}
                                        </StyledText>
                                        {isSelected && (
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' }} />
                                        )}
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </View>

                    {filteredTasks.length === 0 ? (
                        <View style={[
                            homeStyles.card,
                            {
                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                borderWidth: 0.3,
                                borderColor: 'rgba(100, 116, 139, 0.2)',
                                borderRadius: 20,
                                padding: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 140
                            }
                        ]}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: "#8591acff" }]}>
                                <Ionicons name="checkmark-done-circle" size={35} color="#fefeffff" />
                            </View>
                            <StyledText style={[styles.emptyText, { color: colors.PRIMARY_BORDER }]}>
                                {selectedDate === new Date().toISOString().split('T')[0] ? t('today_no_tasks') : t('selected_date_no_tasks')}
                            </StyledText>
                            <StyledText style={[styles.emptySubtext, { color: colors.PRIMARY_BORDER }]}>
                                {t('today_have_nice_day')}
                            </StyledText>
                        </View>
                    ) : (
                        <View style={styles.tasksContainer}>
                            {filteredTasks.map((task, index) => {
                                if (index >= 3) return null;

                                return (
                                    <Pressable
                                        key={task.id}
                                        style={({ pressed }) => [
                                            styles.taskItem,
                                            {
                                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                borderWidth: 0.3,
                                                borderColor: 'rgba(167, 171, 177, 0.3)',
                                                borderRadius: 12,
                                                borderLeftWidth: 15,
                                                borderTopLeftRadius: 25,
                                                borderBottomLeftRadius: 15,
                                                borderLeftColor: getPriorityColor(task) + '80',
                                                opacity: pressed ? 0.7 : 1,
                                                transform: [{ scale: pressed ? 0.98 : 1 }]
                                            }
                                        ]}
                                        onPress={handleTaskPress}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <StyledText style={[styles.taskTitle, { color: colors.PRIMARY_TEXT, marginRight: 8 }]} numberOfLines={1}>
                                                {task.title}
                                            </StyledText>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={styles.timeContainer}>
                                                    <Ionicons name="notifications-outline" size={13} color="#FFB74D" />
                                                    <StyledText style={[styles.timeText, { color: "#FFB74D" }]}>
                                                        {getTimeFromReminder(task.reminder!)}
                                                    </StyledText>
                                                </View>
                                                <Ionicons name="arrow-forward-outline" size={14} color={colors.SECTION_TEXT} />
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                            {filteredTasks.length > 3 && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.viewAllButton,
                                        {
                                            backgroundColor: 'rgba(35, 78, 148, 0.9)',
                                            opacity: pressed ? 0.7 : 1,
                                            transform: [{ scale: pressed ? 0.98 : 1 }]
                                        }
                                    ]}
                                    onPress={handleViewAll}
                                >
                                    <StyledText style={[styles.viewAllText, { color: colors.SECTION_TEXT }]}>
                                        {t('today_view_more')} ({filteredTasks.length - 3})
                                    </StyledText>
                                    <Ionicons name="arrow-forward" size={14} color={colors.SECTION_TEXT} />
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            )}
            {isExpanded && (
                <View style={homeStyles.separatorContainer}>
                    <View style={homeStyles.separatorLine} />
                </View>
            )}
        </View>
    );
}
