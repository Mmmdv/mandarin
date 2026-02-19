import { toggleAnimation } from '@/constants/animations';
import { styles as homeStyles } from '@/constants/homeStyles';
import { formatDate } from '@/helpers/date';
import { useTheme } from '@/hooks/useTheme';
import TodayTasksModal from '@/layout/Modals/TodayTasksModal';
import { selectTodos } from '@/store/slices/todoSlice';
import { Todo } from '@/types/todo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, FlatList, LayoutAnimation, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import StyledText from '../StyledText';

export default function ImportantTasksToday() {
    const { colors, t, lang } = useTheme();
    const todos = useSelector(selectTodos);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [filter, setFilter] = useState<'all' | 'past' | 'waiting'>('all'); // Filter state
    const expandAnim = useRef(new Animated.Value(1)).current;

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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Filter tasks with reminder set for today and sort by time
    const todayTasks = useMemo(() => {
        return todos
            .filter((todo: Todo) => {
                if (!todo.reminder || todo.isCompleted || todo.isArchived) {
                    return false;
                }
                const reminderDate = todo.reminder.split('T')[0];
                return reminderDate === today;
            })
            .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime());
    }, [todos, today]);

    // Filter tasks based on selected tab
    const filteredTasks = useMemo(() => {
        const now = new Date();
        if (filter === 'all') return todayTasks;
        if (filter === 'past') {
            return todayTasks.filter(task => new Date(task.reminder!) < now);
        }
        if (filter === 'waiting') {
            return todayTasks.filter(task => new Date(task.reminder!) >= now);
        }
        return todayTasks;
    }, [todayTasks, filter]);

    const handleTaskPress = () => {
        // Navigate to todo tab
        router.push('/(tabs)/todo');
    };

    const handleViewAll = () => {
        setIsModalOpen(true);
    };

    const getTimeFromReminder = (reminder: string) => {
        return formatDate(reminder, lang).split(' ')[1];
    };

    const getPriorityColor = (task: Todo) => {
        const isOverdue = task.reminder ? new Date(task.reminder) < new Date() : false;
        return isOverdue ? '#d43434' : '#3B82F6';
    };

    return (
        <View style={{ marginBottom: 0, marginTop: 6 }}>
            {/* Header Card */}
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
                        overflow: 'hidden'
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.55)', zIndex: 2 }]}>
                    <Ionicons name="notifications" size={17} color={colors.SECTION_TEXT} />
                </View>
                <StyledText
                    style={[homeStyles.cardTitle, { color: colors.SECTION_TEXT, fontSize: 14, marginBottom: 0, zIndex: 2 }]}
                >
                    {t('today_tasks_header')}
                </StyledText>
                {todayTasks.length > 0 && (
                    <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.15)', zIndex: 2 }]}>
                        <StyledText style={[styles.badgeText, { color: colors.SECTION_TEXT }]}>{todayTasks.length}</StyledText>
                    </View>
                )}
                <View style={{ flex: 1 }} />
                <View style={{ width: 24, alignItems: 'flex-end', justifyContent: 'center', zIndex: 2 }}>
                    <Animated.View style={{ transform: [{ rotate: getRotation() }] }}>
                        <Ionicons
                            name="chevron-forward"
                            size={14}
                            color={colors.SECTION_TEXT}
                        />
                    </Animated.View>
                </View>
                <Animated.View
                    style={[
                        homeStyles.decorativeCircle,
                        {
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
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

            {/* Content Card - Separate and below */}
            {isExpanded && (
                <View style={{ marginTop: 10 }}>
                    {/* Filter Tabs */}
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
                                            backgroundColor: isSelected ? '#3B82F6' : 'transparent', // Blue active or transparent
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <StyledText style={{
                                            color: isSelected ? '#fff' : colors.PLACEHOLDER,
                                            fontSize: 12,
                                            fontWeight: isSelected ? '700' : '500',
                                            marginBottom: isSelected ? 4 : 0, // Space for dot
                                        }}>
                                            {item.label}
                                        </StyledText>
                                        {isSelected && (
                                            <View style={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: '#fff',
                                            }} />
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
                                backgroundColor: 'rgba(100, 116, 139, 0.1)', // Slightly lighter or same
                                borderWidth: 0.3,
                                borderColor: 'rgba(100, 116, 139, 0.2)',
                                borderRadius: 20,
                                padding: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 140
                            }
                        ]}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: colors.PRIMARY_BORDER }]}>
                                <Ionicons name="checkmark-done-circle" size={40} color="#fefeffff" />
                            </View>
                            <StyledText style={[styles.emptyText, { color: colors.PRIMARY_BORDER }]}>
                                {t('today_no_tasks')}
                            </StyledText>
                            <StyledText style={[styles.emptySubtext, { color: colors.PRIMARY_BORDER }]}>
                                {t('today_have_nice_day')}
                            </StyledText>
                        </View>
                    ) : (
                        <View style={styles.tasksContainer}>
                            {filteredTasks.map((task, index) => {
                                // Show only first 2 if not expanding full list, but here we just show distinct items
                                // Show only first 3
                                if (index >= 3) return null;

                                return (
                                    <Pressable
                                        key={task.id}
                                        style={({ pressed }) => [
                                            styles.taskItem,
                                            {
                                                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                                borderWidth: 1,
                                                borderColor: 'rgba(59, 130, 246, 0.1)',
                                                borderLeftWidth: 4,
                                                borderLeftColor: getPriorityColor(task) + '80',
                                                opacity: pressed ? 0.7 : 1,
                                                transform: [{ scale: pressed ? 0.98 : 1 }]
                                            }
                                        ]}
                                        onPress={handleTaskPress}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                            <View style={[styles.taskContent, { flex: 1 }]}>
                                                <StyledText
                                                    style={[styles.taskTitle, { color: colors.PRIMARY_TEXT }]}
                                                    numberOfLines={1}
                                                >
                                                    {task.title}
                                                </StyledText>
                                                <View style={styles.taskFooter}>
                                                    <View style={styles.timeContainer}>
                                                        <Ionicons name="notifications-outline" size={13} color="#FFB74D" />
                                                        <StyledText style={[styles.timeText, { color: "#FFB74D" }]}>
                                                            {getTimeFromReminder(task.reminder!)}
                                                        </StyledText>
                                                    </View>
                                                </View>
                                            </View>
                                            <Ionicons name="chevron-forward" size={14} color="rgba(59, 130, 246, 0.5)" style={{ marginLeft: 8 }} />
                                        </View>
                                    </Pressable>
                                );
                            })}
                            {filteredTasks.length > 3 && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.viewAllButton,
                                        {
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            opacity: pressed ? 0.7 : 1,
                                            transform: [{ scale: pressed ? 0.98 : 1 }]
                                        }
                                    ]}
                                    onPress={handleViewAll}
                                >
                                    <StyledText style={[styles.viewAllText, { color: '#3B82F6' }]}>
                                        {t('today_view_more')} ({filteredTasks.length - 3})
                                    </StyledText>
                                    <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            )}


            <TodayTasksModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tasks={filteredTasks}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        opacity: 0.3,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        opacity: 0.7,
    },
    tasksContainer: {
        gap: 6,
    },
    taskItem: {
        borderRadius: 10,
        paddingVertical: 8, // Increased from 6
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    taskContent: {
        gap: 6, // Increased from 2
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priorityDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    taskTitle: {
        fontSize: 14, // Back to 14
        fontWeight: '600',
        flex: 1,
    },
    taskFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 11, // Increased from 9
        fontWeight: '500',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36, // Reduced height
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    viewAllText: {
        color: '#FFF',
        fontSize: 14, // Reduced font size
        fontWeight: '600',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
