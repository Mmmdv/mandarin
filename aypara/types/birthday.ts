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
    readHistory?: number[]; // Hansı illər tarixçədə oxunub
    greetedHistory?: number[]; // Hansı illər təbrik edilib
}

export interface BirthdayGreeting {
    id: string;
    emoji: string;
    textKey: string; // translations key
}
