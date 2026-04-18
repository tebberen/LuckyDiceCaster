import type { Metadata } from "next";
import "./globals.css";

const frameMetadata = {
  version: "next",
  imageUrl: "https://luckydicecaster.vercel.app/icon.png",
  button: {
    title: "Play Lucky Dice",
    action: {
      type: "launch_frame",
      name: "Lucky Dice",
      url: "https://luckydicecaster.vercel.app/",
      splashImageUrl: "https://luckydicecaster.vercel.app/splash.png",
      splashBackgroundColor: "#000000",
    },
  },
};

export const metadata: Metadata = {
  title: "LuckyDiceCaster",
  description: "Social dice game on Celo",
  other: {
    "fc:frame": JSON.stringify(frameMetadata),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-gold min-h-screen">
        <main className="max-w-[400px] mx-auto px-4 py-6">
          <header className="text-center mb-6">
            <h1 className="text-4xl font-black tracking-tighter mb-1 italic">
              LUCKY DICE
            </h1>
            <p className="text-gold/60 font-bold tracking-widest uppercase text-[10px]">
              Celo Mainnet • Farcaster Frame
            </p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
