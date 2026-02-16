import {
    getRecordingPermissionsAsync,
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState
} from 'expo-audio';
import { useEffect } from 'react';

export const useVoiceRecorder = () => {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    // We use a safe wrapper or check for the recorder state
    // In some cases, passing the recorder too early to useAudioRecorderState causes issues
    const recorderState = useAudioRecorderState(recorder);
    const isRecording = recorderState?.isRecording ?? false;

    // Pre-configure audio mode and prepare recorder
    useEffect(() => {
        let isAlive = true;
        const setup = async () => {
            try {
                await setAudioModeAsync({
                    allowsRecording: true,
                    playsInSilentMode: true,
                    interruptionMode: 'doNotMix',
                    shouldPlayInBackground: true,
                });

                if (isAlive && recorder && typeof recorder.prepareToRecordAsync === 'function') {
                    await recorder.prepareToRecordAsync();
                }
            } catch (e) {
                console.log('Error in recorder setup:', e);
            }
        };
        setup();
        return () => {
            isAlive = false;
        };
    }, [recorder]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const cleanup = async () => {
                try {
                    // Check if recorder is still valid and recording
                    if (recorder && typeof recorder.stop === 'function') {
                        // We check the state if possible, or just try to stop safely
                        if (recorder.isRecording) {
                            await recorder.stop();
                        }
                    }
                } catch (e) {
                    // Ignore cleanup errors
                }
            };
            cleanup();
        };
    }, [recorder]);

    async function startRecording(): Promise<boolean> {
        try {
            const permission = await getRecordingPermissionsAsync();
            if (permission.status !== 'granted') {
                const newPermission = await requestRecordingPermissionsAsync();
                if (newPermission.status !== 'granted') {
                    return false;
                }
            }

            if (!recorder) return false;

            // Ensure we are prepared
            if (typeof recorder.prepareToRecordAsync === 'function') {
                await recorder.prepareToRecordAsync();
            }

            if (typeof recorder.record === 'function') {
                recorder.record();
                return true;
            }
            return false;
        } catch (err: any) {
            const errorMsg = err?.message || "";
            if (errorMsg.includes("561017449") || errorMsg.includes("Session activation failed")) {
                console.log("Microphone is busy");
            } else {
                console.error('Failed to start recording', err);
            }
            return false;
        }
    }

    async function stopRecording(): Promise<string | null> {
        try {
            if (recorder && typeof recorder.stop === 'function') {
                await recorder.stop();
                return recorder.uri || null;
            }
            return null;
        } catch (err) {
            console.error('Failed to stop recording', err);
            return null;
        }
    }

    return {
        isRecording: !!isRecording,
        startRecording,
        stopRecording
    };
};
