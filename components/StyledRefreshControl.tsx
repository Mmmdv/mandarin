import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

interface StyledRefreshControlProps extends RefreshControlProps {
    // You can add custom props here if needed
}

export const StyledRefreshControl: React.FC<StyledRefreshControlProps> = (props) => {
    const { colors } = useTheme();

    return (
        <RefreshControl
            tintColor="#4ECDC4"
            colors={["#4ECDC4"]}
            progressBackgroundColor="#FFFFFF"
            progressViewOffset={10}
            size={1}
            {...props}
        />
    );
};

export default StyledRefreshControl;
