const getMonthNames = (lang: string) => {
    const months: Record<string, string[]> = {
        az: ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"],
        en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
    };
    return months[lang] || months.en;
};

export const getFullFormatDate = (date: Date, lang: string = 'az') => {
    const months = getMonthNames(lang);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export const formatDateToCustomString = (date: Date, lang: string): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const months = getMonthNames(lang);
    const month = months[date.getMonth()];

    return `${day}-${month}-${year}`;
};

export const formatDate = (dateString: string, lang: string = 'az') => {
    const date = new Date(dateString)
    const months = getMonthNames(lang);

    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`
}

export const getShortDate = (dateString: string, lang: string = 'az') => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    const months = getMonthNames(lang);
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];

    return `${day} ${month}`;
}

export const translateReminderStatus = (status: string | undefined, t: any) => {
    if (!status) return undefined;

    switch (status) {
        case 'Gözlənilir': return t("status_pending");
        case 'Dəyişdirilib və ləğv olunub': return t("status_replaced_cancelled");
        case 'Göndərilib': return t("status_sent");
        case 'Ləğv olunub': return t("status_cancelled");
        default: return status;
    }
};

export const formatDuration = (start: string, end: string, t: any) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;

    if (diffMs <= 0) return "0 " + t("minutes_short");

    const diffMins = Math.ceil(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays} ${t("days_short")} ${diffHours % 24} ${t("hours_short")}`;
    }
    if (diffHours > 0) {
        return `${diffHours} ${t("hours_short")} ${diffMins % 60} ${t("minutes_short")}`;
    }
    return `${diffMins} ${t("minutes_short")}`;
};
