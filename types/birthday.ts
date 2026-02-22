export interface Birthday {
    id: string;
    name: string;
    date: string; // ISO date string (month and day matter most)
    phone?: string;
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
