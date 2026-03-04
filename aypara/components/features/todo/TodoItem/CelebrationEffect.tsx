import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Animated } from "react-native"
import { celebrationStyles } from "./styles"

const IDEA_COLORS = ["#FFD700", "#FFA500", "#FFFF00", "#FCD34D", "#F59E0B"]
const STAR_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A855F7", "#F97316"]

export type CelebrationType = 'idea' | 'star'

type AnimationValue = {
    scale: Animated.Value
    opacity: Animated.Value
    translateX: Animated.Value
    translateY: Animated.Value
}

export const createCelebrationAnimations = (): AnimationValue[] =>
    Array.from({ length: 5 }, () => ({
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
    }))

export const playCelebration = (
    animations: AnimationValue[],
    setShowCelebrate: (show: boolean) => void,
) => {
    setShowCelebrate(true)

    animations.forEach((anim) => {
        anim.scale.setValue(0)
        anim.opacity.setValue(1)
        anim.translateX.setValue(0)
        anim.translateY.setValue(0)
    })

    const animationSequences = animations.map((anim, index) => {
        const angle = (index / 5) * 2 * Math.PI
        const distance = 80 + Math.random() * 60

        return Animated.parallel([
            Animated.sequence([
                Animated.timing(anim.scale, {
                    toValue: 2.0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                    toValue: 0.8,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(anim.translateX, {
                toValue: Math.cos(angle) * distance,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
                toValue: Math.sin(angle) * distance - 40,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ])
    })

    Animated.stagger(100, animationSequences).start(() => {
        setShowCelebrate(false)
    })
}

type CelebrationEffectProps = {
    animations: AnimationValue[]
    celebrationType: CelebrationType
    visible: boolean
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ animations, celebrationType, visible }) => {
    if (!visible) return null

    return (
        <>
            {animations.map((anim, index) => (
                <Animated.View
                    key={index}
                    style={[
                        celebrationStyles.star,
                        {
                            transform: [
                                { scale: anim.scale },
                                { translateX: anim.translateX },
                                { translateY: anim.translateY },
                            ],
                            opacity: anim.opacity,
                        }
                    ]}
                >
                    <Ionicons
                        name={celebrationType === 'idea' ? "bulb" : "star"}
                        size={24}
                        color={celebrationType === 'idea' ? IDEA_COLORS[index] : STAR_COLORS[index]}
                    />
                </Animated.View>
            ))}
        </>
    )
}

export default CelebrationEffect
