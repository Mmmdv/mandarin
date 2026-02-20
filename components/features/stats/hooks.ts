import { RootState, useAppSelector } from '@/store';
import { selectTodayData } from '@/store/slices/todaySlice';
import { useMemo } from 'react';
import { Period, filterByPeriod, getDateRange } from './utils';

export function useStatsLogic(period: Period) {
    const appState = useAppSelector((state: RootState) => state.app);
    const todoState = useAppSelector((state: RootState) => state.todo);
    const todayState: any = useAppSelector(selectTodayData);

    const filteredDailyData = useMemo(() => {
        const dailyRecords = todayState.daily || {};
        const { start, end } = getDateRange(period);

        return Object.entries(dailyRecords)
            .filter(([dateStr]) => {
                const d = new Date(dateStr + "T12:00:00");
                return period === "all" || (d >= start && d <= end);
            })
            .map(([, val]) => val as { mood?: number; weight?: number; rating?: number });
    }, [todayState.daily, period]);

    const todoData = useMemo(() => {
        const dailyStats = todoState.dailyStats || {};
        const stats = todoState.stats || {
            totalCreated: 0, totalCompleted: 0, totalDeleted: 0,
            totalArchived: 0, totalCompletionTimeMs: 0
        };

        if (period === "all") {
            return {
                created: stats.totalCreated,
                completed: stats.totalCompleted,
                deleted: stats.totalDeleted,
                archived: stats.totalArchived,
                completionTimeMs: stats.totalCompletionTimeMs,
            };
        }

        const filtered = filterByPeriod(dailyStats, period);
        return filtered.reduce(
            (acc, day) => ({
                created: acc.created + day.created,
                completed: acc.completed + day.completed,
                deleted: acc.deleted + day.deleted,
                archived: acc.archived + day.archived,
                completionTimeMs: acc.completionTimeMs + day.completionTimeMs,
            }),
            { created: 0, completed: 0, deleted: 0, archived: 0, completionTimeMs: 0 }
        );
    }, [period, todoState.stats, todoState.dailyStats]);

    const breathingData = useMemo(() => {
        const history = appState.breathingHistory || {};
        if (period === "all") {
            return appState.breathingStats || { totalSessions: 0, totalDurationSec: 0 };
        }
        const filtered = filterByPeriod(history, period);
        return filtered.reduce(
            (acc, day) => ({
                totalSessions: acc.totalSessions + day.sessions,
                totalDurationSec: acc.totalDurationSec + day.durationSec,
            }),
            { totalSessions: 0, totalDurationSec: 0 }
        );
    }, [period, appState.breathingStats, appState.breathingHistory]);

    const moodMetrics = useMemo(() => {
        const values = filteredDailyData.filter(d => d.mood !== undefined).map(d => d.mood!);
        if (values.length === 0) return null;

        const counts = [0, 0, 0, 0, 0, 0]; // index 1-5
        values.forEach(v => { if (v >= 1 && v <= 5) counts[v]++; });

        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        const moods = [
            { id: 0, icon: '', color: '' }, // placeholder
            { id: 1, icon: 'battery-dead', color: '#475569CC' },
            { id: 2, icon: 'flash-off', color: '#64748BCC' },
            { id: 3, icon: 'leaf', color: '#10B981CC' },
            { id: 4, icon: 'flash', color: '#F59E0BCC' },
            { id: 5, icon: 'flame', color: '#EF4444CC' },
        ];

        return {
            avg: avg.toFixed(1),
            avgMood: moods[Math.round(avg)],
            counts: counts.slice(1), // [1, 2, 3, 4, 5]
            total: values.length,
            moods,
        };
    }, [filteredDailyData]);

    const weightMetrics = useMemo(() => {
        const values = filteredDailyData.filter(d => d.weight !== undefined).map(d => d.weight!);
        if (values.length === 0) return null;
        return {
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
            max: Math.max(...values).toFixed(1),
            min: Math.min(...values).toFixed(1),
        };
    }, [filteredDailyData]);

    const weightChartData = useMemo(() => {
        const dailyRecords = todayState.daily || {};
        const { start, end } = getDateRange(period);

        const filtered = Object.entries(dailyRecords)
            .filter(([dateStr, val]: [string, any]) => {
                const d = new Date(dateStr + "T12:00:00");
                return val.weight !== undefined && (period === "all" || (d >= start && d <= end));
            })
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

        if (filtered.length < 2) return null;

        const labels = filtered.map(([dateStr]) => {
            const d = new Date(dateStr + "T12:00:00");
            if (period === "week" || period === "all") return `${d.getDate()}`;
            if (period === "month") return `${d.getDate()}/${d.getMonth() + 1}`;

            const locale = appState.lang === 'az' ? 'az-AZ' : appState.lang === 'ru' ? 'ru-RU' : 'en-US';
            return d.toLocaleString(locale, { month: 'short' });
        });

        const dataPoints = filtered.map(([, val]: [string, any]) => val.weight);

        const spread = Math.ceil(labels.length / 5);
        const displayLabels = labels.map((l, i) => (i % spread === 0 ? l : ""));

        return {
            labels: displayLabels,
            datasets: [{ data: dataPoints }],
        };
    }, [todayState.daily, period, appState.lang]);

    const ratingMetrics = useMemo(() => {
        const values = filteredDailyData.filter(d => d.rating !== undefined).map(d => d.rating!);
        if (values.length === 0) return null;

        const counts = new Array(11).fill(0); // 1-10 scores
        values.forEach(v => {
            const r = Math.min(Math.max(Math.round(v), 1), 10);
            counts[r]++;
        });

        return {
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
            max: Math.max(...values),
            min: Math.min(...values),
            counts: counts.slice(1).reverse(), // [10, 9, 8, ..., 1]
            total: values.length
        };
    }, [filteredDailyData]);

    return {
        isDark: appState.theme === 'dark',
        todoData,
        breathingData,
        moodMetrics,
        weightMetrics,
        weightChartData,
        ratingMetrics,
        lang: appState.lang
    };
}
