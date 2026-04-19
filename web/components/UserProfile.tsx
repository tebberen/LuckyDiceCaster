"use client";

import { useState, useEffect } from "react";
import { Trophy, Shield, Zap, ChevronUp, Dice6 } from "lucide-react";
import { useAccount, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, ABI } from "./constants";
import { useLuckyDice } from "../hooks/useLuckyDice";

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const { stats, leaderboardAddresses } = useLuckyDice();

  // Fetch stats for all leaderboard addresses in a single multicall
  const { data: leaderboardStatsData, isLoading: isLoadingLB } = useReadContracts({
    contracts: leaderboardAddresses?.flatMap((addr) => [
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: "playerXP",
        args: [addr],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: "playerWins",
        args: [addr],
      },
    ]) || [],
    query: {
      enabled: !!leaderboardAddresses?.length,
    }
  });

  const leaderboard = leaderboardAddresses?.map((addr, i) => {
    const xp = (leaderboardStatsData?.[i * 2]?.result as bigint) || 0n;
    const wins = (leaderboardStatsData?.[i * 2 + 1]?.result as bigint) || 0n;
    return {
      address: addr,
      xp,
      wins,
      rank: i + 1,
    };
  }) || [];

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div id="stats" className="space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 scroll-mt-24">
      {/* Stats Card */}
      <div className="bg-premium-gradient border border-black/5 p-5 rounded-3xl shadow-premium">
        <h3 className="text-black/40 font-black flex items-center gap-2 mb-6 text-[10px] uppercase tracking-[0.2em]">
          <Shield className="w-3 h-3 text-celo-yellow" />
          YOUR ARENA STATS
        </h3>

        {!isConnected ? (
          <div className="py-4 text-center">
            <p className="text-[10px] text-black/20 font-black uppercase italic tracking-widest">Connect wallet to unlock stats</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/5 border border-black/5 p-4 rounded-2xl space-y-2">
              <span className="text-[8px] text-black/40 uppercase font-black tracking-widest">XP POINTS</span>
              <div className="text-xl font-black text-deep-black flex items-center gap-2">
                <Zap className="w-4 h-4 fill-celo-yellow text-celo-yellow" /> {stats.xp.toString()}
              </div>
            </div>
            <div className="bg-black/5 border border-black/5 p-4 rounded-2xl space-y-2">
              <span className="text-[8px] text-black/40 uppercase font-black tracking-widest">TOTAL WINS</span>
              <div className="text-xl font-black text-deep-black flex items-center gap-2">
                <Trophy className="w-4 h-4 text-celo-yellow" /> {stats.wins.toString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Card */}
      <div className="bg-premium-gradient border border-black/5 rounded-3xl overflow-hidden shadow-premium">
        <div className="p-5 flex justify-between items-center border-b border-black/5">
           <div className="flex items-center gap-2">
              <h3 className="text-deep-black font-black text-[11px] uppercase tracking-wider">TOP LEGENDS</h3>
              <span className="bg-celo-yellow/10 text-celo-yellow text-[8px] px-1.5 py-0.5 rounded-full font-black border border-celo-yellow/20">
                {leaderboard?.length || 0}
              </span>
           </div>
           <ChevronUp className="w-4 h-4 text-black/20" />
        </div>

        <div className="divide-y divide-black/5">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((entry, i) => {
              const isYou = entry.address.toLowerCase() === address?.toLowerCase();
              return (
                <div key={i} className={`flex justify-between items-center p-4 hover:bg-black/5 transition-colors ${isYou ? "bg-celo-yellow/5" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? "bg-celo-yellow text-deep-black shadow-sm" : "bg-black/5 text-black/40"
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black ${isYou ? "text-deep-black" : "text-black/80"}`}>
                        {isYou ? "@YOU" : formatAddress(entry.address)}
                      </span>
                      <span className="text-[8px] text-black/40 font-bold uppercase tracking-tighter">
                        {entry.wins.toString()} Total Wins
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] font-black text-deep-black">
                           <Zap className="w-2.5 h-2.5 text-celo-yellow" />
                           {entry.xp.toString()}
                        </div>
                        <div className="text-[8px] text-black/40 font-bold tracking-tighter uppercase">
                          XP Earned
                        </div>
                     </div>
                  </div>
                </div>
              );
            })
          ) : isLoadingLB ? (
            <div className="p-8 text-center animate-pulse">
              <p className="text-[10px] text-black/10 font-black uppercase italic tracking-widest">Summoning Legends...</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[10px] text-black/10 font-black uppercase italic tracking-widest">Arena is empty... Be the first legend!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
