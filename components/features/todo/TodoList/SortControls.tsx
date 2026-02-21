import StyledText from "@/components/ui/StyledText"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

export type SortBy = "date" | "text"
export type SortOrder = "asc" | "desc"

type SortControlsProps = {
    sortBy: SortBy
    sortOrder: SortOrder
    onToggleSortBy: () => void
    onToggleSortOrder: () => void
}

const SortControls: React.FC<SortControlsProps> = ({
    sortBy,
    sortOrder,
    onToggleSortBy,
    onToggleSortOrder,
}) => {
    const { t, colors, isDark } = useTheme()

    return (
        <View style={sortStyles.sortContainer}>
            <TouchableOpacity
                style={[sortStyles.sortButton, { backgroundColor: isDark ? colors.PRIMARY_ACTIVE_BUTTON : colors.PRIMARY_INACTIVE_BUTTON }]}
                onPress={onToggleSortBy}
            >
                <Ionicons
                    name={sortBy === "date" ? "calendar" : "text"}
                    size={14}
                    color={colors.PRIMARY_TEXT}
                />
                <StyledText style={[sortStyles.sortText, { color: colors.PRIMARY_TEXT }]}>
                    {sortBy === "date" ? t("sort_date") : t("sort_text")}
                </StyledText>
            </TouchableOpacity>
            <TouchableOpacity
                style={[sortStyles.sortButton, { backgroundColor: isDark ? colors.PRIMARY_ACTIVE_BUTTON : colors.PRIMARY_INACTIVE_BUTTON }]}
                onPress={onToggleSortOrder}
            >
                <Ionicons
                    name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                    size={14}
                    color={colors.PRIMARY_TEXT}
                />
            </TouchableOpacity>
        </View>
    )
}

const sortStyles = StyleSheet.create({
    sortContainer: {
        flexDirection: "row",
        gap: 5,
        marginRight: 0,
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 3,
    },
    sortText: {
        fontSize: 10,
    },
})

export default SortControls
