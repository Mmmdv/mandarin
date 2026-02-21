export interface Birthday {
    id: string;
    name: string;
    date: string; // ISO date string (month and day matter most)
    nickname?: string; // Müraciət forması (e.g. "Dayı", "Xala", "Can")
    phone?: string;
    note?: string;
    createdAt: string;
    updatedAt?: string;
    notificationId?: string;
    greetingSent?: boolean; // Təbrik göndərilib?
    greetingYear?: number; // Hansı il təbrik göndərilib
}

export interface BirthdayGreeting {
    id: string;
    emoji: string;
    textKey: string; // translations key
}
