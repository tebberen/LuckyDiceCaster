"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { createConfig, http, WagmiProvider } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import "@rainbow-me/rainbowkit/styles.css";

import DiceArena from "../components/DiceArena";
import UserProfile from "../components/UserProfile";

const config = createConfig({
  chains: [celo],
  connectors: [farcasterMiniApp()],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
  },
});

const queryClient = new QueryClient();

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const loadSDK = async () => {
      try {
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          // Set a short timeout to prevent blocking in non-frame environments
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000));
          await Promise.race([sdk.actions.ready(), timeoutPromise]);
        }
      } catch (error) {
        console.error("Frame SDK error:", error);
      }
      setIsSDKLoaded(true);
    };
    loadSDK();
  }, []);

  if (!isSDKLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-celo-yellow border-t-transparent rounded-full animate-spin"></div>
        <div className="text-deep-black font-black tracking-widest text-[10px] animate-pulse">
          INITIALIZING ARENA...
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({
          accentColor: '#FBCC5C',
          accentColorForeground: '#101010',
          borderRadius: 'medium',
        })}>
          <div className="space-y-6 pb-8 animate-in fade-in duration-500">
            <DiceArena />
            <UserProfile />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
