import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import StyledText from "./StyledText";

interface StyledHeaderProps {
    title: string;
    onBackPress?: () => void;
    rightSection?: React.ReactNode;
    showBackButton?: boolean;
}

const StyledHeader: React.FC<StyledHeaderProps> = ({
    title,
    onBackPress,
    rightSection,
    showBackButton = true,
}) => {
    const { colors } = useTheme();
    const router = useRouter();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={[
            styles.header,
            {
                borderBottomColor: colors.PRIMARY_BORDER_DARK,
                backgroundColor: colors.SECONDARY_BACKGROUND,
            }
        ]}>
            <View style={styles.leftSection}>
                {showBackButton && (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>
                )}

                <View style={styles.titleContainer} pointerEvents="none">
                    <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                        {title}
                    </StyledText>
                </View>
            </View>

            <View style={styles.rightPlaceholder}>
                {rightSection}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 55,
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 0.5,
        position: 'relative',
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backButton: {
        padding: 8,
        marginLeft: -15,
        zIndex: 10,
    },
    titleContainer: {
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    rightPlaceholder: {
        minWidth: 40,
        alignItems: 'flex-end',
        zIndex: 10,
    },
});

export default StyledHeader;
