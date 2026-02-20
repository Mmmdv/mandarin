
export type Period = "week" | "month" | "year" | "all";

export function getDateRange(period: Period): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;

    switch (period) {
        case "week":
            start = new Date(end);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            break;
        case "month":
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            break;
        case "year":
            start = new Date(end.getFullYear(), 0, 1);
            break;
        default:
            start = new Date(2000, 0, 1);
    }
    return { start, end };
}

export function filterByPeriod<T>(records: Record<string, T>, period: Period): T[] {
    if (period === "all") return Object.values(records);

    const { start, end } = getDateRange(period);
    return Object.entries(records)
        .filter(([dateStr]) => {
            const d = new Date(dateStr + "T12:00:00");
            return d >= start && d <= end;
        })
        .map(([, val]) => val);
}

export function formatDuration(totalSec: number): string {
    if (totalSec === 0) return "—";
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) return `${hours}s ${mins}d`;
    if (mins > 0) return `${mins}d ${secs}s`;
    return `${secs}s`;
}

export function formatMs(totalMs: number, count: number): string {
    if (count === 0 || totalMs === 0) return "—";
    const avgMs = totalMs / count;
    const minutes = Math.floor(avgMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}g ${hours % 24}s`;
    if (hours > 0) return `${hours}s ${minutes % 60}d`;
    if (minutes > 0) return `${minutes}d`;
    return `<1d`;
}
