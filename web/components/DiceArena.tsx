"use client";

import { useState } from "react";
import { Dice6, Users } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

const TIERS = [
  { id: 0, label: "1 CELO", cost: "1" },
  { id: 1, label: "5 CELO", cost: "5" },
  { id: 2, label: "10 CELO", cost: "10" },
];

// Placeholder ABI for the joinTable function
const ABI = [
  {
    "inputs": [{ "internalType": "uint8", "name": "tier", "type": "uint8" }],
    "name": "joinTable",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export default function DiceArena() {
  const [selectedTier, setSelectedTier] = useState(TIERS[0]);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleJoin = () => {
    writeContract({
      address: '0x0000000000000000000000000000000000000000', // Replace with deployed address
      abi: ABI,
      functionName: 'joinTable',
      args: [selectedTier.id],
      value: parseEther(selectedTier.cost),
    });
  };

  return (
    <div className="bg-black border-2 border-gold p-6 rounded-xl shadow-[0_0_20px_rgba(251,204,92,0.3)] max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gold flex items-center gap-2">
          <Dice6 className="w-8 h-8" />
          DICE ARENA
        </h2>
        <div className="flex gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-1 rounded-full text-sm font-bold border transition-all ${
                selectedTier.id === tier.id
                  ? "bg-gold text-black border-gold"
                  : "text-gold border-gold/50 hover:border-gold"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square border-2 border-gold/20 rounded-lg flex flex-col items-center justify-center bg-gold/5 relative overflow-hidden"
          >
            <Users className="w-8 h-8 text-gold/20" />
            <div className="absolute bottom-1 right-2 text-[10px] text-gold/40 font-bold">
              #{i + 1}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleJoin}
        disabled={isPending || isConfirming}
        className="w-full py-4 bg-gold text-black font-black text-xl rounded-lg hover:bg-gold-light transition-colors shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "SIGNING..." : isConfirming ? "CONFIRMING..." : `JOIN TABLE (${selectedTier.cost} CELO)`}
      </button>

      {isSuccess && <p className="text-center text-green-500 text-xs mt-2 uppercase font-bold">Transaction Successful!</p>}

      <p className="text-center text-gold/60 text-xs mt-4 uppercase tracking-widest">
        6 Players • 5x Payout • 1 Unit House Fee
      </p>
    </div>
  );
}
