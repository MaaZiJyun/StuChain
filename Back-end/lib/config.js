// Do not change these configurations after the blockchain is initialized
module.exports = {
    // INFO: The mining reward could decreases over time like bitcoin. See https://en.bitcoin.it/wiki/Mining#Reward.
    MINING_REWARD: 5000000000,
    // INFO: Usually it's a fee over transaction size (not quantity)
    FEE_PER_TRANSACTION: 0,
    // INFO: Usually the limit is determined by block size (not quantity)
    TRANSACTIONS_PER_BLOCK: 10,
    genesisBlock: {
        index: 0,
        previousHash: '0',
        timestamp: 1465154705,
        nonce: 0,
        difficulty: 4,  // 添加初始难度
        transactions: [
            {
                id: '63ec3ac02f822450039df13ddf7c3c0f19bab4acd4dc928c62fcd78d5ebc6dba',
                hash: null,
                type: 'regular',
                data: {
                    inputs: [],
                    outputs: []
                }
            }
        ]
    },
    // // 移除旧的难度计算方法
    // pow: {
    //     getDifficulty: (blocks, index) => {
    //         // Proof-of-work difficulty settings
    //         const BASE_DIFFICULTY = Number.MAX_SAFE_INTEGER;
    //         const EVERY_X_BLOCKS = 5;
    //         const POW_CURVE = 5;

    //         // INFO: The difficulty is the formula that naivecoin choose to check the proof a work, this number is later converted to base 16 to represent the minimal initial hash expected value.
    //         // INFO: This could be a formula based on time. Eg.: Check how long it took to mine X blocks over a period of time and then decrease/increase the difficulty based on that. See https://en.bitcoin.it/wiki/Difficulty
    //         return Math.max(
    //             Math.floor(
    //                 BASE_DIFFICULTY / Math.pow(
    //                     Math.floor(((index || blocks.length) + 1) / EVERY_X_BLOCKS) + 1
    //                     , POW_CURVE)
    //             )
    //             , 0);
    //     }
    // },

    // 初始难度值  
    INITIAL_DIFFICULTY: 4,  // 可以设置为一个适中的初始难度值

    // * 难度调整参数相关配置  
    DIFFICULTY_ADJUSTMENT_INTERVAL: 10,    // 每 10 个区块调整一次难度  
    BLOCK_GENERATION_INTERVAL: 10,         // 期望的区块生成间隔（秒）  
    DIFFICULTY_ADJUSTMENT_FACTOR: 2,       // 难度调整系数

    MIN_DIFFICULTY: 1,  // 最小难度值  *
    MAX_DIFFICULTY: 32, // 最大难度值  *
    MAX_TIMESTAMP_DIFFERENCE: 7200, // 允许的最大时间戳差异(秒)  *
    MAX_DIFFICULTY_ADJUSTMENT: 4,   // 单次难度调整的最大倍数   *

};