import { useReadContracts, useAccount } from "wagmi";
import { parseEther, formatEther, parseUnits, Address } from "viem";
import { celo } from "viem/chains";
import { CONTRACT_ADDRESS, ABI } from "../components/constants";

export interface UserStats {
  xp: bigint;
  wins: bigint;
}

export interface LeaderboardEntry extends UserStats {
  address: Address;
  rank: number;
}

export function useLuckyDice() {
  const { address } = useAccount();

  // Optimized fetching using multicall pattern (via useReadContracts)
  const { data: userData, refetch: refetchUser } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: "playerXP",
        args: [address as Address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: "playerWins",
        args: [address as Address],
      },
    ],
    query: {
      enabled: !!address,
    },
  });

  const { data: leaderboardAddresses, refetch: refetchLeaderboard } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: "getLeaderboard",
      },
    ],
  });

  const stats: UserStats = {
    xp: (userData?.[0]?.result as bigint) || 0n,
    wins: (userData?.[1]?.result as bigint) || 0n,
  };

  // Gas estimation constants for Celo
  const getCeloGasSettings = () => ({
    maxFeePerGas: parseUnits("35", 9),
    maxPriorityFeePerGas: parseUnits("5", 9),
    gas: 500000n,
  });

  // Unit conversion helpers
  const toCelo = (amount: string) => parseEther(amount);
  const fromCelo = (amount: bigint) => formatEther(amount);

  return {
    stats,
    leaderboardAddresses: (leaderboardAddresses?.[0]?.result as Address[]) || [],
    refetchUser,
    refetchLeaderboard,
    getCeloGasSettings,
    toCelo,
    fromCelo,
  };
}
