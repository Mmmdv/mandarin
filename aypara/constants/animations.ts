import { LayoutAnimation } from "react-native"

export const toggleAnimation = {
    duration: 600,
    create: {
        duration: 600,
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.8,
    },
    update: {
        duration: 600,
        type: LayoutAnimation.Types.spring,
        springDamping: 0.8,
    },
    delete: {
        duration: 400,
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 1.0,
    },
}
