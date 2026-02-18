export const getFullFormatDate = (date: Date, lang: string = 'az') => {
    const locale = lang === 'az' ? 'az-AZ' : lang === 'en' ? 'en-US' : 'ru-RU';
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date).replace('.', '');
}

export const formatDate = (dateString: string, lang: string = 'az') => {
    const date = new Date(dateString)
    const locale = lang === 'az' ? 'az-AZ' : lang === 'en' ? 'en-US' : 'ru-RU'

    const day = date.toLocaleDateString(locale, { day: '2-digit' })
    let month = date.toLocaleDateString(locale, { month: 'short' })

    // Russian specific: fix abbreviations like 'февр.' to 'фев' and remove trailing dots
    if (locale === 'ru-RU') {
        month = month.replace('.', '');
        if (month.toLowerCase() === 'февр') month = 'фев';
        if (month.toLowerCase() === 'сент') month = 'сен';
        if (month.toLowerCase() === 'нояб') month = 'ноя';
    } else {
        month = month.replace('.', '');
    }

    // Capitalize first letter for consistency
    month = month.charAt(0).toUpperCase() + month.slice(1)

    const year = date.toLocaleDateString(locale, { year: '2-digit' })
    const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

    return `${day}-${month}-${year} ${timeStr}`
}

export const getShortDate = (dateString: string, lang: string = 'az') => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const locale = lang === 'az' ? 'az-AZ' : lang === 'en' ? 'en-US' : 'ru-RU';

    if (isToday) {
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }

    let month = date.toLocaleDateString(locale, { month: 'short' });

    // Russian specific fixes for 3-letter consistency
    if (locale === 'ru-RU') {
        month = month.replace('.', '');
        if (month.toLowerCase() === 'февр') month = 'фев';
        if (month.toLowerCase() === 'сент') month = 'сен';
        if (month.toLowerCase() === 'нояб') month = 'ноя';
    } else {
        month = month.replace('.', '');
    }

    month = month.charAt(0).toUpperCase() + month.slice(1);
    const day = date.toLocaleDateString(locale, { day: '2-digit' });

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
