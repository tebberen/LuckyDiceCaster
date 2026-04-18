"use client";

import { Trophy, Shield, Zap } from "lucide-react";
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
    <div className="space-y-6">
      <div className="bg-gold/10 border border-gold/30 p-5 rounded-xl">
        <h3 className="text-gold font-black flex items-center gap-2 mb-4 text-sm uppercase tracking-tight">
          <Shield className="w-4 h-4" />
          YOUR STATS
        </h3>

        {!isConnected ? (
          <p className="text-[10px] text-gold/40 font-bold text-center py-2 uppercase italic">Connect wallet to see stats</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-gold/60 uppercase font-bold">XP Points</span>
              <div className="text-xl font-black text-gold flex items-center gap-1">
                <Zap className="w-4 h-4 fill-gold" /> {xp?.toString() || "0"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gold/60 uppercase font-bold">Total Wins</span>
              <div className="text-xl font-black text-gold">
                {wins?.toString() || "0"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gold/10 border border-gold/30 p-5 rounded-xl">
        <h3 className="text-gold font-black flex items-center gap-2 mb-4 text-sm uppercase tracking-tight">
          <Trophy className="w-4 h-4" />
          LEADERBOARD
        </h3>
        <div className="space-y-3">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((playerAddr, i) => (
              <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-gold/5">
                <div className="flex items-center gap-3">
                  <span className="text-gold/40 font-black text-xs w-4">{i + 1}</span>
                  <span className="text-gold/80 font-mono text-xs font-bold">{formatAddress(playerAddr)}</span>
                </div>
                {playerAddr === address && (
                  <span className="bg-gold text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase">YOU</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-[10px] text-gold/40 font-bold text-center py-2 uppercase italic">No legends yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}
