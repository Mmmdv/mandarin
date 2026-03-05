import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type IOSPickerModalProps = {
  picker: ReturnType<typeof useDateTimePicker>;
  reminder?: string | Date; // Optional, to help with label logic from EditTodoModal
};

const IOSPickerModal: React.FC<IOSPickerModalProps> = ({
  picker,
  reminder,
}) => {
  const { t, colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  if (!picker.showDatePicker && !picker.showTimePicker) return null;

  const isNextMode =
    picker.showDatePicker &&
    (picker.activeMode === "date" ||
      (!picker.activeMode && !reminder && !picker.reminderDate));

  const isBackMode =
    picker.showDatePicker &&
    ((picker.activeMode !== "date" && reminder) ||
      (picker.activeMode !== "date" && picker.reminderDate));

  return (
    <StyledModal
      isOpen={picker.showDatePicker || picker.showTimePicker}
      onClose={picker.closePickers}
    >
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={picker.showDatePicker ? "calendar-outline" : "time-outline"}
              size={28}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>
          <StyledText style={styles.headerText}>
            {picker.showDatePicker ? t("date") : t("time")}
          </StyledText>
        </View>

        <View style={styles.divider} />

        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={picker.tempDate || picker.reminderDate || new Date()}
            mode={picker.showDatePicker ? "date" : "time"}
            display="spinner"
            onChange={
              picker.showDatePicker ? picker.onChangeDate : picker.onChangeTime
            }
            minimumDate={picker.showDatePicker ? picker.todayStart : undefined}
            locale={picker.getLocale()}
            textColor={colors.PRIMARY_TEXT}
            themeVariant={isDark ? "dark" : "light"}
            style={{ width: "100%", transform: [{ scale: 0.85 }] }}
          />
        </View>

        <View style={styles.buttonsContainer}>
          <StyledButton
            label={picker.showTimePicker ? t("back") : t("close")}
            onPress={
              picker.showTimePicker
                ? picker.goBackToDatePicker
                : picker.closePickers
            }
            variant="dark_button"
            style={{ flex: 1 }}
          />
          <StyledButton
            label={
              picker.showDatePicker
                ? isNextMode
                  ? t("next")
                  : isBackMode
                    ? t("back")
                    : t("next")
                : t("save")
            }
            onPress={
              picker.showDatePicker
                ? isNextMode
                  ? picker.confirmDateIOS
                  : isBackMode
                    ? picker.goBackToTimePicker
                    : picker.confirmDateIOS
                : picker.confirmTimeIOS
            }
            variant="dark_button"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default IOSPickerModal;
