import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import React, { useMemo } from "react";
import {
    Dimensions,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { styles } from "./styles";

type AddMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onAddIterativeTask: () => void;
  onAddBirthday: () => void;
  onAddMovie: () => void;
};

const AddMenuModal: React.FC<AddMenuModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onAddIterativeTask,
  onAddBirthday,
  onAddMovie,
}) => {
  const { colors, t, isDark } = useTheme();
  const { width } = Dimensions.get("window");
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    const items = [
      {
        id: "task",
        icon: "checkbox-outline" as const,
        label: t("menu_add_task"),
        onPress: onAddTask,
        color: colors.PRIMARY_TEXT,
        disabled: false,
      },
      {
        id: "iterative",
        icon: "repeat-outline" as const,
        label: t("menu_add_iterative") || "Təkrarlanan tapşırıq",
        onPress: onAddIterativeTask,
        color: colors.PRIMARY_TEXT,
        disabled: false,
      },
      {
        id: "birthday",
        icon: "gift-outline" as const,
        label: t("menu_add_birthday"),
        onPress: onAddBirthday,
        color: colors.PRIMARY_TEXT,
        disabled: false,
      },
      {
        id: "movie",
        icon: "film-outline" as const,
        label: t("menu_add_movie"),
        onPress: onAddMovie,
        color: colors.PRIMARY_TEXT,
        disabled: true,
      },
    ];

    if (pathname.includes("todo")) {
      return items;
    } else if (pathname.includes("birthday")) {
      const task = items[0];
      const iterative = items[1];
      const birthday = items[2];
      return [birthday, task, iterative, items[3]];
    }
    return items;
  }, [
    pathname,
    t,
    colors,
    onAddTask,
    onAddIterativeTask,
    onAddBirthday,
    onAddMovie,
  ]);

  const MenuItem = ({
    icon,
    label,
    onPress,
    disabled = false,
    color,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    disabled?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.menuItem,
        {
          opacity: disabled ? 0.3 : 1,
          borderBottomColor: colors.PRIMARY_BORDER_DARK,
          borderBottomWidth: disabled ? 0 : 0.5,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.12)"
              : color
                ? `${color}15`
                : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={color || colors.PRIMARY_TEXT} />
      </View>
      <StyledText style={[styles.menuLabel, { color: colors.PRIMARY_TEXT }]}>
        {label}
      </StyledText>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.SECONDARY_BACKGROUND,
                opacity: 0.9,
                borderColor: colors.PRIMARY_BORDER_DARK,
                bottom: 68,
                left: width / 2 + 20,
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                onPress={item.onPress}
                color={item.color}
                disabled={item.disabled}
              />
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddMenuModal;
