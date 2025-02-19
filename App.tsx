import { useEffect } from "react";
import { notificationService } from "@/lib/services/notification";
import { useGlobalContext } from "@/lib/global-provider";

export default function App() {
  const { user } = useGlobalContext();

  useEffect(() => {
    if (user?.$id) {
      notificationService.registerForPushNotifications(user.$id);
    }
  }, [user]);

  // ... diğer kodlar
}
