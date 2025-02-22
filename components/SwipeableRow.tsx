import React from 'react';
import { Animated, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '@/lib/theme-provider';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const { isDarkMode, theme } = useTheme();

  const renderRightActions = () => {
    return (
      <RectButton
        style={{
          width: 80,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ef4444',
          borderRadius: 12,
        }}
        onPress={onDelete}
      >
        <Animated.Text
          style={{ color: 'white', fontFamily: 'Rubik_500Medium' }}
        >
          Sil
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}
