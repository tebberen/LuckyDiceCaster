"use client";

import { Dice6, Users } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, parseUnits } from "viem";
import { celo } from "wagmi/chains";
import { CONTRACT_ADDRESS, ABI } from "./constants";

const TIERS = [
  { id: 0, label: "1 CELO", cost: "1" },
  { id: 1, label: "5 CELO", cost: "5" },
  { id: 2, label: "10 CELO", cost: "10" },
];

export default function DiceArena() {
  const { isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending: isSigning, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleJoin = (tierId: number, cost: string) => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    if (chainId !== celo.id) {
      switchChain({ chainId: celo.id });
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'joinTable',
      args: [tierId],
      value: parseEther(cost),
      chainId: celo.id,
      gas: 200000n,
      maxPriorityFeePerGas: parseUnits('0.1', 9),
    } as any);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#FBCC5C] flex items-center gap-2 px-2">
        <Dice6 className="w-6 h-6" />
        AVAILABLE TABLES
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className="bg-black border border-[#FBCC5C]/40 p-4 rounded-xl shadow-[0_0_15px_rgba(251,204,92,0.1)] hover:border-[#FBCC5C] transition-colors"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-[#FBCC5C]">{tier.label} TABLE</h3>
                <p className="text-[10px] text-[#FBCC5C]/60 uppercase tracking-widest font-bold">5x Payout • 6 Players</p>
              </div>
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#FBCC5C]/10 border border-[#FBCC5C]/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#FBCC5C]/40" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-[#FBCC5C]/5 border border-[#FBCC5C]/10 flex items-center justify-center text-[10px] font-bold text-[#FBCC5C]/30">
                  +3
                </div>
              </div>
            </div>

            <button
              onClick={() => handleJoin(tier.id, tier.cost)}
              disabled={isSigning || isConfirming}
              className="w-full py-3 bg-[#FBCC5C] text-black font-black text-sm rounded-lg hover:bg-[#FBCC5C]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {!isConnected ? "CONNECT WALLET" :
               isSigning ? "SIGNING..." :
               isConfirming ? "CONFIRMING..." :
               `JOIN FOR ${tier.cost} CELO`}
            </button>
          </div>
        ))}
      </div>

      {isSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 p-3 rounded-lg text-center animate-in zoom-in duration-300">
          <p className="text-green-500 text-[10px] uppercase font-black">Transaction Successful!</p>
          {hash && (
             <a
               href={`https://celoscan.io/tx/${hash}`}
               target="_blank"
               rel="noopener noreferrer"
               className="text-green-500/70 text-[8px] underline mt-1 block"
             >
               VIEW ON EXPLORER
             </a>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-2 rounded-lg text-center">
          <p className="text-red-500 text-[10px] uppercase font-black">Error: {error.message.split('\n')[0]}</p>
        </div>
      )}
    </div>
  );
}
