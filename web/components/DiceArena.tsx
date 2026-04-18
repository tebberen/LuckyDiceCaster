"use client";

import { Dice6, Users } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, ABI } from "./constants";

const TIERS = [
  { id: 0, label: "1 CELO", cost: "1" },
  { id: 1, label: "5 CELO", cost: "5" },
  { id: 2, label: "10 CELO", cost: "10" },
];

export default function DiceArena() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleJoin = (tierId: number, cost: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'joinTable',
      args: [tierId],
      value: parseEther(cost),
    } as any);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gold flex items-center gap-2 px-2">
        <Dice6 className="w-6 h-6" />
        AVAILABLE TABLES
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className="bg-black border border-gold/40 p-4 rounded-xl shadow-[0_0_15px_rgba(251,204,92,0.1)] hover:border-gold transition-colors"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-gold">{tier.label} TABLE</h3>
                <p className="text-[10px] text-gold/60 uppercase tracking-widest font-bold">5x Payout • 6 Players</p>
              </div>
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-gold/40" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-[10px] font-bold text-gold/30">
                  +3
                </div>
              </div>
            </div>

            <button
              onClick={() => handleJoin(tier.id, tier.cost)}
              disabled={isPending || isConfirming}
              className="w-full py-3 bg-gold text-black font-black text-sm rounded-lg hover:bg-gold-light transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "SIGNING..." : isConfirming ? "CONFIRMING..." : `JOIN FOR ${tier.cost} CELO`}
            </button>
          </div>
        ))}
      </div>

      {isSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 p-2 rounded-lg text-center">
          <p className="text-green-500 text-[10px] uppercase font-black">Transaction Successful!</p>
        </div>
      )}
    </div>
  );
}
