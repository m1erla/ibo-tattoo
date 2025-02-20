import { useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
  FadeIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

import { useGlobalContext } from '@/lib/global-provider';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import images from '@/constants/images';
import { useTheme } from '@/lib/theme-provider';
import icons from '@/constants/icons';

const { width } = Dimensions.get('window');

interface User extends Record<string, any> {
  $id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'client';
}

type Appointment = {
  _id: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  designDetails: {
    size: string;
    style: string;
    placement: string;
  };
  price: number;
};

type PortfolioItem = {
  _id: string;
  title: string;
  images: string[];
  style: string;
};

export default function Index() {
  const router = useRouter();
  const { user, logout } = useGlobalContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentWorks, setRecentWorks] = useState<PortfolioItem[]>([]);
  const { isDarkMode } = useTheme();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Randevuları getir
        const appointmentsData = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.appointmentsCollectionId!,
          [
            ...(user.role === 'admin'
              ? [Query.orderDesc('dateTime')]
              : [
                  Query.equal('clientId', user.$id),
                  Query.orderDesc('dateTime'),
                ]),
            Query.limit(5),
          ]
        );
        setAppointments(
          appointmentsData.documents.map((doc) => ({
            _id: doc.$id,
            dateTime: doc.dateTime,
            status: doc.status,
            designDetails: doc.designDetails,
            price: doc.price,
          }))
        );

        // Son portföy çalışmalarını getir
        const portfolioData = await databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.portfolioCollectionId!,
          [Query.orderDesc('createdAt'), Query.limit(3)]
        );
        setRecentWorks(
          portfolioData.documents.map((doc) => ({
            _id: doc.$id,
            title: doc.title,
            images: doc.images,
            style: doc.style,
          }))
        );
      } catch (error: any) {
        if (error.code === 404) {
          console.log(
            'Koleksiyon bulunamadı, lütfen Appwrite konsolunda koleksiyonları oluşturun'
          );
        } else {
          console.error('Veri çekme hatası:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  // Tema bazlı renkler güncellendi
  const theme = {
    background: {
      primary: (isDark: boolean) => (isDark ? '#121212' : '#FAFAFA'),
    },
    card: {
      background: isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white',
      border: isDarkMode ? 'border-[#2A2A2A]' : 'border-gray-100',
    },
    text: {
      primary: (isDark: boolean) => (isDark ? '#FFFFFF' : '#1A1A1A'),
      secondary: (isDark: boolean) => (isDark ? '#B0B0B0' : '#666666'),
      tertiary: (isDark: boolean) => (isDark ? '#808080' : '#999999'),
      inverse: (isDark: boolean) => (isDark ? '#FFFFFF' : '#1A1A1A'),
      muted: (isDark: boolean) => (isDark ? '#666666' : '#9CA3AF'),
    },
    status: {
      pending: isDarkMode
        ? 'bg-amber-900/30 text-amber-400'
        : 'bg-amber-100 text-amber-800',
      confirmed: isDarkMode
        ? 'bg-blue-900/30 text-blue-400'
        : 'bg-blue-100 text-blue-800',
      completed: isDarkMode
        ? 'bg-emerald-900/30 text-emerald-400'
        : 'bg-emerald-100 text-emerald-800',
      cancelled: isDarkMode
        ? 'bg-rose-900/30 text-rose-400'
        : 'bg-rose-100 text-rose-800',
    },
    colors: {
      background: {
        primary: (isDark: boolean) => (isDark ? '#121212' : '#F8F9FA'),
        secondary: (isDark: boolean) => (isDark ? '#1A1A1A' : '#FFFFFF'),
      },
      accent: {
        primary: '#FF3366', // Modern, canlı pembe
        secondary: '#7209B7', // Derin mor
        tertiary: '#4361EE', // Elektrik mavisi
      },
      gradient: {
        primary: ['#FF3366', '#7209B7'] as const,
        secondary: ['#4361EE', '#3A0CA3'] as const,
      },
      status: {
        pending: {
          background: (isDark: boolean) => (isDark ? '#3A1D1D' : '#FFF1F1'),
          text: (isDark: boolean) => (isDark ? '#FF9494' : '#DC2626'),
        },
        confirmed: {
          background: (isDark: boolean) => (isDark ? '#1A2F35' : '#F0F9FF'),
          text: (isDark: boolean) => (isDark ? '#7DD3FC' : '#0369A1'),
        },
        // ... diğer renkler
      },
    },
  };

  const getStatusColor = (
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const colors = isDarkMode
      ? {
          pending: 'bg-amber-500/20 text-amber-400',
          confirmed: 'bg-neutral-500/20 text-neutral-300',
          completed: 'bg-emerald-500/20 text-emerald-400',
          cancelled: 'bg-rose-500/20 text-rose-400',
        }
      : ({
          pending: 'bg-amber-100 text-amber-800',
          confirmed: 'bg-neutral-100 text-neutral-800',
          completed: 'bg-emerald-100 text-emerald-800',
          cancelled: 'bg-rose-100 text-rose-800',
        } as const);
    return colors[status];
  };

  const getStatusText = (
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const texts = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    };
    return texts[status] || status;
  };

  const handleAppointmentsPress = () => {
    router.push('/(root)/(tabs)/appointments' as any);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-[${theme.colors.background.primary(isDarkMode)}]`}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Kullanıcı Profil Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6 pt-6 pb-4"
        >
          <BlurView
            intensity={20}
            className="flex-row items-center p-4 rounded-2xl overflow-hidden"
          >
            <Animated.Image
              entering={FadeIn.delay(200)}
              source={user?.avatar ? { uri: user.avatar } : images.avatar}
              className="w-16 h-16 rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-white/60 text-base font-rubik">
                Hoş Geldiniz 👋
              </Text>
              <Text className="text-white text-xl font-rubik-bold mt-1">
                {user?.name}
              </Text>
            </View>
            {isAdmin && (
              <View className="px-3 py-1 bg-[#FF3366]/20 rounded-full">
                <Text className="text-[#FF3366] font-rubik-medium">Admin</Text>
              </View>
            )}
          </BlurView>
        </Animated.View>

        {/* Hero Section - Yeniden Tasarlandı */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mx-6 h-48 relative overflow-hidden rounded-3xl"
        >
          <Image
            source={images.tattooBackground}
            className="absolute w-full h-full"
            style={{ opacity: 0.7 }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            className="absolute w-full h-full"
          />
          <View className="absolute bottom-0 w-full p-6">
            <Text className="text-white text-2xl font-rubik-bold">
              Profesyonel Dövme Stüdyosu
            </Text>
            <Text className="text-white/80 font-rubik mt-2">
              Hayalinizdeki dövmeyi gerçeğe dönüştürün
            </Text>
          </View>
        </Animated.View>

        {/* Hızlı Erişim Kartları */}
        <View className="mt-8">
          <Animated.Text
            entering={FadeInDown.delay(300)}
            className="px-6 text-lg font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}] mb-4"
          >
            Hızlı Erişim
          </Animated.Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-6"
          >
            <Animated.View entering={SlideInRight.delay(400)} className="mr-4">
              <Pressable
                onPress={() => router.push('/create-appointment')}
                className="w-40 h-48 relative overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  className="absolute w-full h-full"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View className="p-4 flex-1 justify-between">
                  <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                    <Image
                      source={icons.calendar}
                      className="w-5 h-5"
                      style={{ tintColor: '#FFFFFF' }}
                    />
                  </View>
                  <View>
                    <Text className="text-white font-rubik-bold text-lg">
                      Randevu Al
                    </Text>
                    <Text className="text-white/70 font-rubik text-sm mt-1">
                      Hemen başlayalım
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>

            <Animated.View entering={SlideInRight.delay(500)} className="mr-4">
              <Pressable
                onPress={() => router.push('/portfolio')}
                className="w-40 h-48 relative overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={theme.colors.gradient.secondary}
                  className="absolute w-full h-full"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View className="p-4 flex-1 justify-between">
                  <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                    <Image
                      source={icons.gallery}
                      className="w-5 h-5"
                      style={{ tintColor: '#FFFFFF' }}
                    />
                  </View>
                  <View>
                    <Text className="text-white font-rubik-bold text-lg">
                      Portfolyo
                    </Text>
                    <Text className="text-white/70 font-rubik text-sm mt-1">
                      Çalışmalarımız
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </View>

        {/* Son Çalışmalar */}
        <View className="mt-8">
          <Animated.Text
            entering={FadeInDown.delay(600)}
            className="px-6 text-lg font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}] mb-4"
          >
            Son Çalışmalar
          </Animated.Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-6"
          >
            {recentWorks.map((work, index) => (
              <Animated.View
                key={work._id}
                entering={SlideInRight.delay(700 + index * 100)}
                className="mr-4"
              >
                <Pressable className="w-64 rounded-2xl overflow-hidden">
                  <Image
                    source={{ uri: work.images[0] }}
                    className="w-full h-80"
                    style={{ borderRadius: 20 }}
                  />
                  <BlurView
                    intensity={80}
                    className="absolute bottom-0 w-full p-4"
                  >
                    <Text className="text-white font-rubik-bold text-lg">
                      {work.title}
                    </Text>
                    <Text className="text-white/80 font-rubik mt-1">
                      {work.style}
                    </Text>
                  </BlurView>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Son Randevular */}
        <View className="mt-8 px-6 pb-20">
          <Animated.Text
            entering={FadeInDown.delay(800)}
            className="text-lg font-rubik-bold text-[${theme.colors.text.primary(isDarkMode)}] mb-4"
          >
            Son Randevular
          </Animated.Text>

          {appointments.slice(0, 3).map((appointment, index) => (
            <Animated.View
              key={appointment._id}
              entering={FadeInDown.delay(900 + index * 100).springify()}
              className="mb-4"
            >
              <Pressable
                onPress={() => router.push(`/appointments/${appointment._id}`)}
                className="p-4 rounded-2xl bg-gradient-to-r from-[${theme.colors.background.secondary(isDarkMode)}] to-[${theme.colors.background.primary(isDarkMode)}]"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text
                      className={`${theme.text.primary} text-lg font-rubik-medium`}
                    >
                      {format(new Date(appointment.dateTime), 'd MMMM yyyy')}
                    </Text>
                    <Text className={`${theme.text.secondary} mt-1`}>
                      {format(new Date(appointment.dateTime), 'HH:mm')}
                    </Text>
                  </View>
                  <View
                    className={`px-4 py-2 rounded-full bg-[${getStatusColor(appointment.status)}]`}
                  >
                    <Text className="text-white font-rubik-medium">
                      {getStatusText(appointment.status)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
