import type { Metadata } from "next";
import { ArrowLeft, BarChart3, Home } from "lucide-react";
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
      splashBackgroundColor: "#101010",
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
      <body className="bg-deep-black text-off-white min-h-screen flex flex-col items-center">
        <main className="w-full max-w-[390px] min-h-screen flex flex-col bg-deep-black shadow-2xl relative pb-20">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-deep-black/50 backdrop-blur-md sticky top-0 z-50">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal border border-white/10 text-[11px] font-bold hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tighter">CELO ARENA</span>
                <span className="bg-celo/10 text-celo text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">BETA</span>
              </div>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal border border-white/10 text-[11px] font-bold hover:bg-white/5 transition-colors">
              <BarChart3 className="w-3 h-3 text-celo" />
              Stats
            </button>
          </header>

          <div className="flex-1 px-4 py-4 space-y-6">
            {children}
          </div>

          {/* Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-deep-black/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-center z-50">
            <button className="p-3 bg-celo/10 rounded-full border border-celo/20 hover:bg-celo/20 transition-all active:scale-90">
              <Home className="w-6 h-6 text-celo fill-celo/20" />
            </button>
          </nav>
        </main>
      </body>
    </html>
  );
}
