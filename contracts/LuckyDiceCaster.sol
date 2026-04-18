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
        address[] players;
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

    function joinTable(TableTier tier) external payable {
        Table storage table = tables[tier];
        require(msg.value == table.cost, "Incorrect CELO amount");
        require(table.players.length < TABLE_SIZE, "Table full");

        for (uint256 i = 0; i < table.players.length; i++) {
            require(table.players[i] != msg.sender, "Already in table");
        }

        table.players.push(msg.sender);
        emit TableJoined(msg.sender, tier, table.players.length);

        if (table.players.length == TABLE_SIZE) {
            _resolveGame(tier);
        }
    }

    function _resolveGame(TableTier tier) internal {
        Table storage table = tables[tier];

        // Pseudo-random winner selection
        uint256 winnerIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, table.players))) % TABLE_SIZE;
        address winner = table.players[winnerIndex];

        uint256 totalPool = table.cost * TABLE_SIZE;
        uint256 payout = table.cost * 5;
        uint256 fee = totalPool - payout; // Should be exactly 1 unit (table.cost)

        // Reset table before transfers to prevent reentrancy issues
        address[] memory playersToReward = table.players;
        delete table.players;

        (bool success, ) = payable(winner).call{value: payout}("");
        require(success, "Payout failed");

        (bool feeSuccess, ) = payable(owner).call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        _updateXPAndLeaderboard(winner, playersToReward);

        emit GameResolved(winner, tier, payout);
    }

    function _updateXPAndLeaderboard(address winner, address[] memory players) internal {
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            uint256 xpGain = (player == winner) ? 100 : 10;
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

    function getTablePlayers(TableTier tier) external view returns (address[] memory) {
        return tables[tier].players;
    }
}
