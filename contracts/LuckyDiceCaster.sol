// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LuckyDiceCaster
 * @dev A social dice game with 3 table tiers, XP, and leaderboards.
 */
contract LuckyDiceCaster {
    uint256 public constant TABLE_SIZE = 6;
    address public owner;

    enum TableTier { ONE, FIVE, TEN }

    struct Table {
        address[6] seats;
        uint256 playerCount;
        uint256 cost;
    }

    mapping(TableTier => Table) public tables;
    mapping(address => uint256) public playerXP;
    mapping(address => uint256) public playerWins;
    address[] public leaderboard;

    event TableJoined(address indexed player, TableTier tier, uint256 playerCount);
    event GameResolved(address indexed winner, TableTier tier, uint256 payout);
    event XPIncreased(address indexed player, uint256 amount);

    constructor() {
        owner = msg.sender;
        tables[TableTier.ONE].cost = 1 ether;
        tables[TableTier.FIVE].cost = 5 ether;
        tables[TableTier.TEN].cost = 10 ether;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function joinTable(TableTier tier, uint8 seatIndex) external payable {
        require(seatIndex < TABLE_SIZE, "Invalid seat");
        Table storage table = tables[tier];
        require(msg.value == table.cost, "Incorrect CELO amount");
        require(table.playerCount < TABLE_SIZE, "Table full");
        require(table.seats[seatIndex] == address(0), "Seat occupied");

        for (uint256 i = 0; i < TABLE_SIZE; i++) {
            require(table.seats[i] != msg.sender, "Already in table");
        }

        table.seats[seatIndex] = msg.sender;
        table.playerCount++;
        emit TableJoined(msg.sender, tier, table.playerCount);

        if (table.playerCount == TABLE_SIZE) {
            _resolveGame(tier);
        }
    }

    function _resolveGame(TableTier tier) internal {
        Table storage table = tables[tier];

        // Pseudo-random winner selection
        uint256 winnerIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, table.seats))) % TABLE_SIZE;
        address winner = table.seats[winnerIndex];

        uint256 totalPool = table.cost * TABLE_SIZE;
        uint256 payout = table.cost * 5;
        uint256 fee = totalPool - payout; // Should be exactly 1 unit (table.cost)

        // Copy players to memory for reward processing and reset table
        address[] memory playersToReward = new address[](TABLE_SIZE);
        for (uint256 i = 0; i < TABLE_SIZE; i++) {
            playersToReward[i] = table.seats[i];
            table.seats[i] = address(0);
        }
        table.playerCount = 0;

        (bool success, ) = payable(winner).call{value: payout}("");
        require(success, "Payout failed");

        (bool feeSuccess, ) = payable(owner).call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        _updateXPAndLeaderboard(winner, playersToReward, table.cost);

        emit GameResolved(winner, tier, payout);
    }

    function _updateXPAndLeaderboard(address winner, address[] memory players, uint256 cost) internal {
        uint256 baseXP = cost / 1 ether;
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            uint256 xpGain = (player == winner) ? baseXP * 2 : baseXP;
            playerXP[player] += xpGain;
            if (player == winner) playerWins[player]++;

            emit XPIncreased(player, xpGain);
            _updateLeaderboard(player);
        }
    }

    function _updateLeaderboard(address player) internal {
        // Optimization: Find if player is already in leaderboard
        int256 index = -1;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i] == player) {
                index = int256(i);
                break;
            }
        }

        if (index == -1) {
            if (leaderboard.length < 100) {
                leaderboard.push(player);
                index = int256(leaderboard.length - 1);
            } else if (playerXP[player] > playerXP[leaderboard[99]]) {
                leaderboard[99] = player;
                index = 99;
            }
        }

        if (index != -1) {
            // Move player up if they have more XP than the person above them
            uint256 i = uint256(index);
            while (i > 0 && playerXP[leaderboard[i]] > playerXP[leaderboard[i - 1]]) {
                address temp = leaderboard[i];
                leaderboard[i] = leaderboard[i - 1];
                leaderboard[i - 1] = temp;
                i--;
            }
        }
    }

    function getLeaderboard() external view returns (address[] memory) {
        return leaderboard;
    }

    function getTablePlayers(TableTier tier) external view returns (address[6] memory) {
        return tables[tier].seats;
    }
}
