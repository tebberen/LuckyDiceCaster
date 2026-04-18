"use client";

import { Trophy, Shield, Zap } from "lucide-react";

export default function UserProfile() {
  // Placeholder data
  const userData = {
    address: "0x1234...5678",
    xp: 1250,
    wins: 12,
    rank: 4,
  };

  const leaderboard = [
    { address: "0xabcd...efgh", xp: 5200 },
    { address: "0x9876...5432", xp: 4800 },
    { address: "0x1111...2222", xp: 3500 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
      <div className="bg-gold/10 border border-gold/30 p-6 rounded-xl">
        <h3 className="text-gold font-bold flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" />
          YOUR STATS
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gold/60">Rank</span>
            <span className="text-gold font-mono font-bold">#{userData.rank}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gold/60">XP Points</span>
            <span className="text-gold font-mono font-bold flex items-center gap-1">
              <Zap className="w-4 h-4 fill-gold" /> {userData.xp}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gold/60">Total Wins</span>
            <span className="text-gold font-mono font-bold">{userData.wins}</span>
          </div>
        </div>
      </div>

      <div className="bg-gold/10 border border-gold/30 p-6 rounded-xl">
        <h3 className="text-gold font-bold flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5" />
          LEADERBOARD
        </h3>
        <div className="space-y-3">
          {leaderboard.map((entry, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <div className="flex gap-2">
                <span className="text-gold/40 font-mono w-4">{i + 1}.</span>
                <span className="text-gold/80 font-mono">{entry.address}</span>
              </div>
              <span className="text-gold font-bold">{entry.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
