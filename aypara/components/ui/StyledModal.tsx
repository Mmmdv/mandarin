import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    LayoutAnimation,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    UIManager,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type StyledModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayPress?: boolean;
  expectsKeyboard?: boolean;
};

const StyledModal: React.FC<StyledModalProps> = ({
  isOpen,
  onClose,
  children,
  closeOnOverlayPress = true,
  expectsKeyboard = false,
}) => {
  const { colors, isDark } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isReady, setIsReady] = useState(!expectsKeyboard);

  const [stickyKeyboardHeight, setStickyKeyboardHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen) {
      setIsReady(!expectsKeyboard);
      slideAnim.setValue(30);
      fadeAnim.setValue(0);
      setStickyKeyboardHeight(0); // Reset only when modal closing
    } else {
      // Start opening animation immediately
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (expectsKeyboard) {
        setIsReady(true);
      }
    }
  }, [isOpen, expectsKeyboard]);

  useEffect(() => {
    if (Platform.OS === "android") {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardDidShowListener = Keyboard.addListener(
      keyboardShowEvent,
      (e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(true);
        if (expectsKeyboard) {
          setStickyKeyboardHeight(e.endCoordinates.height + 10);
        }
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      keyboardHideEvent,
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardVisible(false);
        setStickyKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [expectsKeyboard]);

  const isPositionBottom = expectsKeyboard && isKeyboardVisible;

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={{ flex: 1, backgroundColor: "transparent" }}>
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.78)"
              : "rgba(0, 0, 0, 0.4)",
          }}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Pressable
            style={[
              styles.modalBackgroundContainer,
              {
                justifyContent: isPositionBottom ? "flex-end" : "center",
                paddingBottom: isPositionBottom ? stickyKeyboardHeight : 0,
              },
            ]}
            onPress={() => {
              Keyboard.dismiss();
              if (closeOnOverlayPress) {
                onClose();
              }
            }}
          >
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  backgroundColor: "transparent",
                  padding: 0,
                  width: "auto",
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Pressable
                style={{ width: "100%", alignItems: "center" }}
                onPress={() => {}}
              >
                {children}
              </Pressable>
            </Animated.View>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  modalBackgroundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {},
});

export default React.memo(StyledModal);
