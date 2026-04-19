"use client";

import { useState, useEffect } from "react";
import { Dice6, Users, Wallet, Trophy, ChevronDown, CheckCircle2 } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, parseUnits, formatEther } from "viem";
import { celo } from "wagmi/chains";
import { CONTRACT_ADDRESS, ABI } from "./constants";

const TIERS = [
  { id: 0, label: "1", cost: "1", bonus: "+1XP", currency: "CELO" },
  { id: 1, label: "5", cost: "5", bonus: "+5XP", currency: "CELO" },
  { id: 2, label: "10", cost: "10", bonus: "+10XP", currency: "CELO" },
];

export default function DiceArena() {
  const [selectedTier, setSelectedTier] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending: isSigning, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (error) {
      console.error("Transaction Error Details:", error);
    }
  }, [error]);

  const { data: currentPlayers, refetch: refetchPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getTablePlayers',
    args: [selectedTier],
    chainId: celo.id,
    query: {
      retry: false,
      staleTime: 5000,
    }
  });

  useEffect(() => {
    const interval = setInterval(() => refetchPlayers(), 5000);
    return () => clearInterval(interval);
  }, [refetchPlayers]);

  useEffect(() => {
    setSelectedSeat(null);
  }, [selectedTier]);

  const handleJoin = async (tierId: number, cost: string) => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    if (chainId !== celo.id) {
      switchChain({ chainId: celo.id });
      return;
    }

    if (selectedSeat === null) return;

    try {
      // 1. ELIGIBILITY CHECK: Use current hook data for immediate validation
      const latestPlayers = (currentPlayers as unknown as `0x${string}`[]) || [];

      // Check if seat is occupied
      if (latestPlayers[selectedSeat] && latestPlayers[selectedSeat] !== "0x0000000000000000000000000000000000000000") {
        console.error("PRE-FLIGHT REJECTION: Seat occupied.", {
          seat: selectedSeat,
          occupant: latestPlayers[selectedSeat]
        });
        alert("This seat is occupied! Please select another one.");
        refetchPlayers();
        return;
      }

      // Check if user is already in
      if (address && latestPlayers.some(p => p.toLowerCase() === address.toLowerCase())) {
        console.error("PRE-FLIGHT REJECTION: User already in table.");
        alert("You are already registered for this table!");
        return;
      }

      // Check if table is full
      const playerCount = latestPlayers.filter(p => p !== "0x0000000000000000000000000000000000000000").length;
      if (playerCount >= 6) {
        console.error("PRE-FLIGHT REJECTION: Table full.");
        alert("This table is full! Please try another tier.");
        return;
      }

      // 2. FORCE AGGRESSIVE GAS FEES (To ensure success on Celo)
      const maxFeePerGas = parseUnits('40', 9);
      const maxPriorityFeePerGas = parseUnits('5', 9);

      console.log("PRE-TRANSACTION AUDIT:", {
        tierId,
        selectedSeat_zeroIndexed: selectedSeat,
        selectedSeat_visual: (selectedSeat as number) + 1,
        valueCELO: cost,
        valueWei: parseEther(cost).toString(),
        contractAddress: CONTRACT_ADDRESS,
        chainId: celo.id
      });

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'joinTable',
        args: [tierId, selectedSeat],
        value: parseEther(cost),
        chain: celo,
        chainId: celo.id,
        gas: 500000n,
        type: 'eip1559',
        maxPriorityFeePerGas,
        maxFeePerGas,
      } as any);
    } catch (err) {
      console.error("UNEXPECTED ERROR IN handleJoin:", err);

      console.log("FALLBACK PRE-TRANSACTION AUDIT:", {
        tierId,
        selectedSeat_zeroIndexed: selectedSeat,
        selectedSeat_visual: (selectedSeat as number) + 1,
        valueCELO: cost,
        valueWei: parseEther(cost).toString(),
        contractAddress: CONTRACT_ADDRESS,
        chainId: celo.id
      });

      // Fallback if estimation fails entirely
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'joinTable',
        args: [tierId, selectedSeat],
        value: parseEther(cost),
        chain: celo,
        chainId: celo.id,
        gas: 500000n,
        type: 'eip1559',
        maxPriorityFeePerGas: parseUnits('5', 9),
        maxFeePerGas: parseUnits('40', 9),
      } as any);
    }
  };

  const players = (currentPlayers as unknown as `0x${string}`[]) || [];
  const spotsLeft = 6 - players.filter(p => p !== "0x0000000000000000000000000000000000000000").length;
  const progressWidth = (players.filter(p => p !== "0x0000000000000000000000000000000000000000").length / 6) * 100;
  const isUserIn = players.some(p => p.toLowerCase() === address?.toLowerCase());

  const formatAddr = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tier Cards */}
      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 bg-premium-gradient shadow-premium ${
              selectedTier === tier.id
                ? "border-gold-premium ring-2 ring-gold-premium/10 scale-[1.02]"
                : "border-black/5 opacity-80 hover:opacity-100"
            }`}
          >
            <span className="absolute -top-2 px-2 py-0.5 bg-celo-yellow text-deep-black text-[7px] font-black rounded-full shadow-sm">
              {tier.bonus}
            </span>
            <div className="flex items-center gap-1 mt-1">
               <span className="text-sm font-black text-deep-black">{tier.label}</span>
               <div className="w-3 h-3 rounded-full bg-celo-yellow flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
               </div>
            </div>
            <span className="text-[8px] text-black/40 font-bold uppercase tracking-widest mt-0.5">entry</span>
          </button>
        ))}
      </div>


      {/* Core Pot Card */}
      <div className="bg-premium-gradient border border-black/5 shadow-premium rounded-3xl p-5 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[9px] text-black/40 font-black uppercase tracking-widest">POT</span>
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 rounded-full bg-celo-yellow flex items-center justify-center shadow-sm">
                  <Dice6 className="w-3 h-3 text-deep-black" />
               </div>
               <span className="text-2xl font-black text-deep-black">
                {players.length * Number(TIERS[selectedTier].cost)} CELO
               </span>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-deep-black/80">{players.length} / 6 players</span>
             <div className="w-24 h-1.5 bg-black/5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-celo-yellow transition-all duration-500 rounded-full"
                  style={{ width: `${progressWidth}%` }}
                />
             </div>
             <span className="text-[8px] text-black/40 font-bold mt-1 block uppercase">{spotsLeft} slots left</span>
          </div>
        </div>

        {/* Bonus Notification */}
        <div className="bg-celo-yellow/10 border border-celo-yellow/20 p-3 rounded-2xl flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-celo-yellow flex items-center justify-center shadow-sm">
              <Trophy className="w-4 h-4 text-deep-black" />
           </div>
           <div className="flex-1">
              <p className="text-[9px] font-black text-deep-black uppercase tracking-tight">Winner gets 2X XP Bonus!</p>
              <p className="text-[8px] text-black/40 font-medium">Pool is currently filling — play to win!</p>
           </div>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => {
            const player = players[i];
            const isOccupied = player && player !== "0x0000000000000000000000000000000000000000";
            const isYou = isOccupied && player?.toLowerCase() === address?.toLowerCase();
            const isSelected = selectedSeat === i;

            return (
              <button
                key={i}
                disabled={!!isOccupied || isUserIn}
                onClick={() => setSelectedSeat(isSelected ? null : i)}
                className={`aspect-square rounded-full border flex flex-col items-center justify-center p-2 gap-1.5 transition-all ${
                  isOccupied
                    ? isYou ? "bg-white border-gold-premium shadow-lg shadow-gold-premium/10" : "bg-black/5 border-black/5"
                    : isSelected
                      ? "bg-celo-yellow/10 border-celo-yellow shadow-md scale-105"
                      : "bg-transparent border-black/10 border-dashed hover:border-celo-yellow/40 hover:bg-celo-yellow/5"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                   isOccupied
                     ? isYou ? "bg-celo-yellow text-deep-black" : "bg-black/10 text-black/40"
                     : isSelected ? "bg-celo-yellow text-deep-black" : "bg-transparent text-black/20"
                } ${!isOccupied && !isSelected ? "border border-black/10" : ""}`}>
                  {i + 1}
                </div>
                <span className={`text-[8px] font-black truncate w-full text-center uppercase tracking-tighter ${
                  isOccupied ? isYou ? "text-celo-yellow" : "text-black/20" : isSelected ? "text-deep-black" : "text-black/20"
                }`}>
                  {isOccupied ? (isYou ? "YOU" : formatAddr(player)) : isSelected ? "SELECTED" : "EMPTY"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Round Status */}
        <button className="w-full py-3 px-4 bg-black/5 border border-black/5 rounded-2xl flex justify-between items-center hover:bg-black/10 transition-colors">
           <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">ROUND #17937 • {players.length}/6 PLAYERS</span>
           <ChevronDown className="w-3 h-3 text-black/20" />
        </button>

        {/* Join Action */}
        <div className="pt-2 text-center">
          {isUserIn ? (
            <div className="py-3 text-[11px] font-black text-deep-black flex flex-col items-center gap-1">
               <div className="flex items-center gap-1.5">
                You're in with <span className="bg-celo-yellow text-deep-black px-1.5 py-0.5 rounded shadow-sm">#{players.findIndex(p => p.toLowerCase() === address?.toLowerCase()) + 1}</span>
               </div>
               <span className="text-[9px] text-black/40 uppercase tracking-widest font-black">waiting for {spotsLeft} more</span>
            </div>
          ) : (
            <button
              onClick={() => handleJoin(selectedTier, TIERS[selectedTier].cost)}
              disabled={isSigning || isConfirming || (isConnected && selectedSeat === null)}
              className="w-full py-4 bg-celo-yellow text-deep-black font-black text-xs rounded-2xl shadow-premium hover:bg-gold-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-black/5 disabled:text-black/20 uppercase tracking-widest"
            >
              {!isConnected ? "Connect Wallet" :
               isSigning ? "Signing..." :
               isConfirming ? "Confirming..." :
               selectedSeat === null ? "Select a Seat" :
               `Join for ${TIERS[selectedTier].cost} CELO`}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {isSuccess && (
        <div className="bg-celo/10 border border-celo/30 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-celo" />
          <div className="flex-1 text-left">
            <p className="text-celo text-[10px] uppercase font-black tracking-widest">Joined Successfully!</p>
            {hash && (
               <a href={`https://celoscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-white/40 text-[8px] underline">
                 View Transaction
               </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl text-center">
          <p className="text-red-500 text-[10px] font-black uppercase tracking-tight">
            {error.name === 'ContractFunctionExecutionError'
              ? (error as any).shortMessage || error.message.split('\n')[0]
              : error.message.split('\n')[0]}
          </p>
          <p className="text-[8px] text-red-500/60 mt-1 uppercase font-bold tracking-tighter">Check console for details</p>
        </div>
      )}
    </div>
  );
}
