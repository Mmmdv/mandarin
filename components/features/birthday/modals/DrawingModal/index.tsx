import StyledButton from '@/components/ui/StyledButton';
import StyledModal from '@/components/ui/StyledModal';
import StyledText from '@/components/ui/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { getStyles } from './styles';

type Point = { x: number; y: number; t: number };
type Stroke = Point[];

type DrawingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSend?: () => void;
};

const DrawingModal: React.FC<DrawingModalProps> = ({ isOpen, onClose, onSend }) => {
    const { colors, isDark, t } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    // Original strokes (full data)
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke>([]);

    // Displayed paths (strings for SVG)
    const [displayedPaths, setDisplayedPaths] = useState<string[]>([]);
    const [currentPathString, setCurrentPathString] = useState<string>('');

    const [isReplaying, setIsReplaying] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const viewShotRef = useRef<any>(null);
    const replayTimerRef = useRef<NodeJS.Timeout[]>([]);
    const startTimeRef = useRef<number>(0);

    const onGestureEvent = (event: any) => {
        if (isReplaying) return;

        const { x, y } = event.nativeEvent;
        const now = Date.now();

        if (!isDrawing) {
            setIsDrawing(true);
            if (strokes.length === 0) {
                startTimeRef.current = now;
            }
        }

        const point: Point = { x, y, t: now - startTimeRef.current };
        setCurrentStroke((prev) => [...prev, point]);

        const pathPoint = `${x.toFixed(1)},${y.toFixed(1)}`;
        if (currentPathString === '') {
            setCurrentPathString(`M${pathPoint}`);
        } else {
            setCurrentPathString((prev) => `${prev} L${pathPoint}`);
        }
    };

    const onHandlerStateChange = (event: any) => {
        if (isReplaying) return;

        if (event.nativeEvent.state === State.END) {
            if (currentStroke.length > 1) {
                setStrokes((prev) => [...prev, currentStroke]);
                setDisplayedPaths((prev) => [...prev, currentPathString]);
            }
            setCurrentStroke([]);
            setCurrentPathString('');
            setIsDrawing(false);
        }
    };

    const handleClear = () => {
        setStrokes([]);
        setDisplayedPaths([]);
        setCurrentStroke([]);
        setCurrentPathString('');
        setIsReplaying(false);
        setIsDrawing(false);
        clearReplayTimers();
    };

    const clearReplayTimers = () => {
        replayTimerRef.current.forEach(timer => clearTimeout(timer));
        replayTimerRef.current = [];
    };

    const startReplay = () => {
        if (strokes.length === 0 || isReplaying) return;
        setIsReplaying(true);
        setDisplayedPaths([]);
        setCurrentPathString('');
        clearReplayTimers();

        // Prepare all events
        const allEvents: { type: 'start' | 'move' | 'end', x?: number, y?: number, time: number, strokeIndex: number }[] = [];

        strokes.forEach((stroke, sIdx) => {
            stroke.forEach((p, pIdx) => {
                allEvents.push({
                    type: pIdx === 0 ? 'start' : 'move',
                    x: p.x,
                    y: p.y,
                    time: p.t,
                    strokeIndex: sIdx
                });
            });
            allEvents.push({
                type: 'end',
                time: stroke[stroke.length - 1].t + 50, // Small pause after each stroke
                strokeIndex: sIdx
            });
        });

        let activeStrokesStrings: string[] = [];
        let currentString = '';

        allEvents.forEach((ev, idx) => {
            const timer = setTimeout(() => {
                if (ev.type === 'start') {
                    currentString = `M${ev.x?.toFixed(1)},${ev.y?.toFixed(1)}`;
                    setCurrentPathString(currentString);
                } else if (ev.type === 'move') {
                    currentString += ` L${ev.x?.toFixed(1)},${ev.y?.toFixed(1)}`;
                    setCurrentPathString(currentString);
                } else if (ev.type === 'end') {
                    activeStrokesStrings = [...activeStrokesStrings, currentString];
                    setDisplayedPaths(activeStrokesStrings);
                    setCurrentPathString('');
                }

                if (idx === allEvents.length - 1) {
                    setIsReplaying(false);
                }
            }, ev.time);
            replayTimerRef.current.push(timer);
        });
    };

    const handleShare = async () => {
        if (strokes.length === 0) {
            Alert.alert(t("error"), t("birthday_draw_please_draw"));
            return;
        }

        try {
            const uri = await viewShotRef.current?.capture?.();
            if (uri) {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(uri);
                    onSend?.();
                    onClose();
                } else {
                    Alert.alert(t("error"), t("birthday_draw_share_failed"));
                }
            }
        } catch (error) {
            console.error("Capture/Share error:", error);
            Alert.alert(t("error"), t("birthday_draw_share_failed"));
        }
    };

    useEffect(() => {
        return () => clearReplayTimers();
    }, []);

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <StyledText style={styles.headerText}>
                        {t("birthday_draw_greeting")}
                    </StyledText>
                    {(isDrawing || isReplaying) && (
                        <View style={styles.recordingIndicator}>
                            <View style={[styles.recordingDot, isReplaying && { backgroundColor: '#40A9FF' }]} />
                            <StyledText style={[styles.recordingText, isReplaying && { color: '#40A9FF' }]}>
                                {isReplaying ? t("replay") : t("recording")}
                            </StyledText>
                        </View>
                    )}
                </View>

                <View style={[styles.canvasContainer, isReplaying && styles.canvasReplaying]}>
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                        enabled={!isReplaying}
                    >
                        <View style={{ flex: 1 }}>
                            <ViewShot
                                ref={viewShotRef}
                                options={{ format: 'png', quality: 1.0 }}
                                style={{ flex: 1, backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }}
                            >
                                <Svg style={styles.canvas}>
                                    {displayedPaths.map((path, index) => (
                                        <Path
                                            key={index}
                                            d={path}
                                            stroke={isDark ? '#FFFFFF' : '#000000'}
                                            strokeWidth={4}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                        />
                                    ))}
                                    {currentPathString !== '' && (
                                        <Path
                                            d={currentPathString}
                                            stroke={isDark ? '#FFFFFF' : '#000000'}
                                            strokeWidth={4}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                        />
                                    )}
                                </Svg>
                            </ViewShot>
                        </View>
                    </PanGestureHandler>
                </View>

                <View style={styles.toolbar}>
                    <TouchableOpacity
                        style={[styles.toolButton, styles.clearButton]}
                        onPress={handleClear}
                        disabled={isReplaying}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF4D4F" />
                        <StyledText style={styles.clearText}>{t("clear")}</StyledText>
                    </TouchableOpacity>

                    {strokes.length > 0 && (
                        <TouchableOpacity
                            style={[styles.toolButton, styles.replayButton]}
                            onPress={startReplay}
                            disabled={isReplaying}
                        >
                            <Ionicons name="play-outline" size={20} color="#40A9FF" />
                            <StyledText style={styles.replayText}>{t("replay")}</StyledText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.toolButton, styles.sendButton]}
                        onPress={handleShare}
                        disabled={isReplaying}
                    >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                        <StyledText style={styles.sendText}>{t("birthday_send_greeting")}</StyledText>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerButtons}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default React.memo(DrawingModal);
