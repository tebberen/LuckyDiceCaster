"use client";

import { Trophy, Shield, Zap, ChevronUp, Dice6 } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, ABI } from "./constants";

export default function UserProfile() {
  const { address, isConnected } = useAccount();

  const { data: xp } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'playerXP',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: wins } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'playerWins',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: leaderboard } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getLeaderboard',
  });

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div id="stats" className="space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 scroll-mt-24">
      {/* Stats Card */}
      <div className="bg-[#EAB308]/20 border border-white/20 p-5 rounded-3xl backdrop-blur-sm">
        <h3 className="text-white/60 font-black flex items-center gap-2 mb-6 text-[10px] uppercase tracking-[0.2em]">
          <Shield className="w-3 h-3 text-white" />
          YOUR ARENA STATS
        </h3>

        {!isConnected ? (
          <div className="py-4 text-center">
            <p className="text-[10px] text-white/40 font-black uppercase italic tracking-widest">Connect wallet to unlock stats</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl space-y-2">
              <span className="text-[8px] text-white/60 uppercase font-black tracking-widest">XP POINTS</span>
              <div className="text-xl font-black text-white flex items-center gap-2">
                <Zap className="w-4 h-4 fill-white" /> {xp?.toString() || "0"}
              </div>
            </div>
            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl space-y-2">
              <span className="text-[8px] text-white/60 uppercase font-black tracking-widest">TOTAL WINS</span>
              <div className="text-xl font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white" /> {wins?.toString() || "0"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Card - Styled like "Recent Rounds" */}
      <div className="bg-[#EAB308]/20 border border-white/20 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-5 flex justify-between items-center border-b border-white/10">
           <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-[11px] uppercase tracking-wider">TOP LEGENDS</h3>
              <span className="bg-white/10 text-white/60 text-[8px] px-1.5 py-0.5 rounded-full font-black">
                {leaderboard?.length || 0}
              </span>
           </div>
           <ChevronUp className="w-4 h-4 text-white/20" />
        </div>

        <div className="divide-y divide-white/5">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((playerAddr, i) => {
              const isYou = playerAddr.toLowerCase() === address?.toLowerCase();
              return (
                <div key={i} className={`flex justify-between items-center p-4 hover:bg-white/10 transition-colors ${isYou ? "bg-white/20" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? "bg-white text-[#FBCC5C] shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "bg-white/10 text-white/60"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black ${isYou ? "text-white" : "text-white/80"}`}>
                        {isYou ? "@YOU" : formatAddress(playerAddr)}
                      </span>
                      <span className="text-[8px] text-white/60 font-bold uppercase tracking-tighter">Round Champion</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] font-black text-white">
                           <Dice6 className="w-2.5 h-2.5" />
                           180
                        </div>
                        <div className="text-[8px] text-white/40 font-bold tracking-tighter uppercase">
                          Celo Earned
                        </div>
                     </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-[10px] text-white/20 font-black uppercase italic tracking-widest">Arena is empty... Be the first legend!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
