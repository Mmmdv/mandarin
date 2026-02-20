import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { View } from 'react-native';
import { statsStyles } from './styles';

interface SectionHeaderProps {
    icon?: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor?: string;
    title: string;
    colors: any;
    emoji?: string;
    accentColor?: string;
}

export function SectionHeader({ icon, iconBg, iconColor, title, colors, emoji, accentColor }: SectionHeaderProps) {
    return (
        <View style={statsStyles.sectionHeader}>
            {accentColor && <View style={[statsStyles.accentCorner, { borderColor: accentColor }]} />}
            <View style={[statsStyles.sectionIconWrap, { backgroundColor: iconBg }]}>
                {emoji ? (
                    <StyledText style={{ fontSize: 16 }}>{emoji}</StyledText>
                ) : (
                    <Ionicons name={icon!} size={20} color={iconColor} />
                )}
            </View>
            <StyledText style={[statsStyles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>
                {title}
            </StyledText>
        </View>
    );
}
