import { COLORS } from "@/constants/ui";
import { StyleSheet, TextInput, TextInputProps } from "react-native";


type StyledTextInputProps = TextInputProps & {
    isError?: boolean
};

const StyledTextInput: React.FC<StyledTextInputProps> = ({ isError, ...props }) => {
    return (
        <TextInput
            style={[style.input, props.style, isError ? style.error : null]}
            {...props}
            placeholderTextColor={COLORS.PLACEHOLDER} />
    )
}

const style = StyleSheet.create({
    input: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        color: COLORS.PRIMARY_TEXT,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.PRIMARY_BORDER,
        flex: 1
    },
    error: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    }
})

export default StyledTextInput