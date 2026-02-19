import { COLORS } from "@/constants/ui";
import { StyleSheet, TextInput, TextInputProps } from "react-native";


type StyledTextInputProps = TextInputProps & {
    isError?: boolean
    backgroundColor?: string
    placeholderColor?: string
};

const StyledTextInput: React.FC<StyledTextInputProps> = ({ isError, backgroundColor, placeholderColor, ...props }) => {
    return (
        <TextInput
            style={[style.input, props.style, isError ? style.error : null, backgroundColor ? { backgroundColor } : null]}
            {...props}
            placeholderTextColor={placeholderColor || COLORS.PRIMARY_TEXT_BLACK} />
    )
}

const style = StyleSheet.create({
    input: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        color: COLORS.PRIMARY_TEXT_BLACK,
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
