import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkState {
  isOnline: boolean;
}

export default function useNetwork(): NetworkState {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      (state: NetInfoState) => {
        const online =
          Boolean(state.isConnected) &&
          Boolean(state.isInternetReachable);

        setIsOnline(online);
      }
    );

    return () => unsubscribe();
  }, []);

  return { isOnline };
}
