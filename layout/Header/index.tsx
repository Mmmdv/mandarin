import StyledText from "@/components/StyledText";
import { COLORS } from "@/constants/ui";
import { StyleSheet, View } from "react-native";

type HeaderProps = {
  totalTodos: number
  completedTodos: number

}

const Header: React.FC<HeaderProps> = ({ totalTodos, completedTodos }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerMainContent}>
        <StyledText variant="title">To do APP</StyledText>
        <StyledText variant="subtitle">Jan 30, 2025</StyledText>
      </View>
      <StyledText>Completed {completedTodos} / {totalTodos}</StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //flex: 0,
    paddingTop: 50, //yuxaridan mesafe
    paddingBottom: 20, //ashagidan mesafe
    paddingHorizontal: 15, // soldan mesafe
    backgroundColor: COLORS.SECONDARY_BACKGROUND,
  },
  headerMainContent: {
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 10, // setirler arasi mesafe
  },
});

export default Header;
