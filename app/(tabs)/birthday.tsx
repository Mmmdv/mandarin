import BirthdayList from "@/components/features/birthday/BirthdayList";
import AddBirthdayModal from "@/components/features/birthday/modals/AddBirthdayModal";
import GestureWrapper from "@/components/layout/GestureWrapper";
import useBirthday from "@/hooks/useBirthday";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function Birthday() {
    const { colors } = useTheme();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const {
        birthdays,
        todayBirthdays,
        upcomingBirthdays,
        onAddBirthday,
        onDeleteBirthday,
        onMarkGreetingSent,
        getDaysUntilBirthday,
        getAge,
    } = useBirthday();

    return (
        <GestureWrapper>
            <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <BirthdayList
                    birthdays={birthdays}
                    todayBirthdays={todayBirthdays}
                    upcomingBirthdays={upcomingBirthdays}
                    onDelete={onDeleteBirthday}
                    onMarkGreetingSent={onMarkGreetingSent}
                    onAddRequest={() => setIsAddModalOpen(true)}
                    getDaysUntilBirthday={getDaysUntilBirthday}
                    getAge={getAge}
                />

                <AddBirthdayModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={onAddBirthday}
                />
            </View>
        </GestureWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 0,
    },
});
