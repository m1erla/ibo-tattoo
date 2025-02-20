import { View, Text } from 'react-native';
import { useTheme } from '@/lib/theme-provider';

export const SatisfactionMeter = ({ value }: { value: number }) => {
  const { isDarkMode, theme } = useTheme();

  return (
    <View
      className={`p-4 rounded-2xl bg-[${theme.colors.card.background(isDarkMode)}]`}
    >
      <Text
        className={`text-lg font-rubik-medium text-[${theme.colors.text.primary(isDarkMode)}]`}
      >
        Müşteri Memnuniyeti
      </Text>
      <Text
        className={`text-2xl font-rubik-bold text-[${theme.colors.accent.primary}] mt-2`}
      >
        %{value}
      </Text>
    </View>
  );
};
