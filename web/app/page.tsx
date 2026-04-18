"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { createConfig, http, WagmiProvider } from "wagmi";
import { celo } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DiceArena from "../components/DiceArena";
import UserProfile from "../components/UserProfile";

const config = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const loadSDK = async () => {
      await sdk.actions.ready();
      setIsSDKLoaded(true);
    };
    if (sdk) {
      loadSDK();
    }
  }, []);

  if (!isSDKLoaded) {
    return <div className="text-center py-20 text-gold animate-pulse">Initializing Frame...</div>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="space-y-8 pb-12">
          <DiceArena />
          <UserProfile />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
