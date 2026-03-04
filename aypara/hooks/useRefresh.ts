import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

export const useRefresh = (refreshTime: number = 1500) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulating data fetch/refresh
        setTimeout(() => {
            setRefreshing(false);
        }, refreshTime);
    }, [refreshTime]);

    return {
        refreshing,
        onRefresh,
    };
};

export default useRefresh;
