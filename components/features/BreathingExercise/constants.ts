export const SOUNDS = {
    whoosh: require('../../../assets/sounds/whoosh.wav'),
    sea: require('../../../assets/sounds/sea.mp3'),
};

export const COLORS_THEME = {
    primary: '#D2B48C', // Tan/Sand
    accent: '#F5F5DC',  // Beige/Cream
    text: '#FDF5E6',    // OldLace (off-white)
    textMuted: 'rgba(253, 245, 230, 0.6)',
    backgroundLight: 'rgba(210, 180, 140, 0.1)',
    backgroundMedium: 'rgba(210, 180, 140, 0.2)',
};

export const PHASE_DURATIONS = {
    inhale: 4,
    hold: 3,
    exhale: 6,
};

export const getMotivationalMessages = (t: any) => [
    t("breathing_msg_1"),
    t("breathing_msg_2"),
    t("breathing_msg_3"),
    t("breathing_msg_4"),
    t("breathing_msg_5"),
    t("breathing_msg_6"),
    t("breathing_msg_7"),
];

export type Phase = 'inhale' | 'exhale' | 'hold';
