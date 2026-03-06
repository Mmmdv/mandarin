export const getReminderStatusProps = (
  reminderStatus: string | undefined,
  reminderCancelled: boolean | undefined,
  isCompleted: boolean | undefined,
  colors: any,
) => {
  const isCrossedOut =
    reminderStatus === "Ləğv olunub" ||
    reminderStatus === "Dəyişdirilib və ləğv olunub" ||
    reminderCancelled ||
    isCompleted;

  const isSent = reminderStatus === "Göndərilib";
  const isPending =
    reminderStatus === "Gözlənilir" ||
    (!isCrossedOut && !isSent && !!reminderStatus);

  let iconName: any = "hourglass-outline";
  let iconColor = "#FFD166";
  let opacity = 1;

  if (isCrossedOut) {
    iconName = "notifications-off";
    iconColor = colors.ERROR_INPUT_TEXT;
    opacity = 0.5;
  } else if (isSent) {
    iconName = "checkmark-done-outline";
    iconColor = colors.CHECKBOX_SUCCESS;
    opacity = 0.5;
  } else {
    iconName = "hourglass-outline";
    iconColor = "#FFD166";
    opacity = 1;
  }

  return {
    isCrossedOut,
    isSent,
    isPending,
    iconName,
    iconColor,
    opacity,
  };
};
