const R = require('ramda');
const spawn = require('threads').spawn;
const Block = require('../blockchain/block');
const CryptoUtil = require('../util/cryptoUtil');
const Transaction = require('../blockchain/transaction');
const Config = require('../config');

class Miner {
    constructor(blockchain, logLevel) {
        this.blockchain = blockchain;   // 区块链实例
        this.logLevel = logLevel;   // 日志级别
    }

    mine(rewardAddress, feeAddress) {   // rewardAddress: 挖矿奖励的接收地址    feeAddress: 交易费用的接收地址
        let baseBlock = Miner.generateNextBlock(rewardAddress, feeAddress, this.blockchain);    // 生成下一个候选区块
        /* 调试参数处理：
            使用 Ramda 的 reject 函数移除命令行参数中包含 'debug' 的项，确保在创建新线程时不会传递调试相关的参数。
        */
        process.execArgv = R.reject((item) => item.includes('debug'), process.execArgv);

        /* istanbul ignore next */
        // 创建挖矿线程
        const thread = spawn(function (input, done) {   // 使用 spawn 创建新的工作线程
            /*eslint-disable */
            require(input.__dirname + '/../util/consoleWrapper.js')('mine-worker', input.logLevel);
            const Block = require(input.__dirname + '/../blockchain/block');
            const Miner = require(input.__dirname);
            /*eslint-enable */

            // 执行工作量证明并完成。调用 proveWorkFor 方法进行实际的挖矿工作；done 回调用于返回挖矿结果。
            done(Miner.proveWorkFor(Block.fromJson(input.jsonBlock), input.difficulty));
        });

        // 交易列表处理
        const transactionList = R.pipe(
            R.countBy(R.prop('type')),  // 按交易类型计数
            R.toString,                 // 转换为字符串
            R.replace('{', ''),         // 移除左花括号
            R.replace('}', ''),
            R.replace(/"/g, '')         //移除所有引号
        )(baseBlock.transactions);

        // 输出正在挖矿的区块信息，包括交易数量和类型统计
        console.info(`Mining a new block with ${baseBlock.transactions.length} (${transactionList}) transactions`);

        // 获取调整后的难度值  
        const adjustedDifficulty = Miner.getAdjustedDifficulty(this.blockchain.getLastBlock(), this.blockchain);

        // 创建一个 Promise 来处理异步挖矿结果
        const promise = thread.promise().then((result) => {
            thread.kill();  // 完成时清理线程
            return result;  // 返回结果
        });
        
        // 发送数据到线程：
        thread.send({
            __dirname: __dirname,       // 当前目录路径
            logLevel: this.logLevel,    // 日志级别
            jsonBlock: baseBlock,       // 待挖掘的区块
            // difficulty: this.blockchain.getDifficulty() // 当前难度值
            difficulty: adjustedDifficulty // 使用调整后的难度值
        });

        return promise;
    }

    // 创建新的候选区块
    static generateNextBlock(rewardAddress, feeAddress, blockchain) {
        const previousBlock = blockchain.getLastBlock();        // 获取最后一个区块
        const index = previousBlock.index + 1;                  // 新区块的索引号
        const previousHash = previousBlock.hash;                // 前一个区块的哈希值
        const timestamp = new Date().getTime() / 1000;          // 当前时间戳（秒）
        const blocks = blockchain.getAllBlocks();               // 获取所有区块
        const candidateTransactions = blockchain.transactions;  // 待处理的交易
        // 获取所有区块中的交易
        const transactionsInBlocks = R.flatten(R.map(R.prop('transactions'), blocks));
        // 获取交易中的输入
        const inputTransactionsInTransaction = R.compose(R.flatten, R.map(R.compose(R.prop('inputs'), R.prop('data'))));

        // Select transactions that can be mined    交易筛选过程
        let rejectedTransactions = [];      // 被拒绝的交易
        let selectedTransactions = [];      // 被选中的交易
        R.forEach((transaction) => {
            let negativeOutputsFound = 0;
            let i = 0;
            let outputsLen = transaction.data.outputs.length;   // 获取交易输出数组的长度

            // Check for negative outputs (avoiding negative transactions or 'stealing')
            for (i = 0; i < outputsLen; i++) {
                if (transaction.data.outputs[i].amount < 0) {
                    negativeOutputsFound++;
                }
            }
            // Check if any of the inputs is found in the selectedTransactions or in the blockchain
            let transactionInputFoundAnywhere = R.map((input) => {
                let findInputTransactionInTransactionList = R.find(
                    R.whereEq({
                        'transaction': input.transaction,
                        'index': input.index
                    }));

                // Find the candidate transaction in the selected transaction list (avoiding double spending)
                let wasItFoundInSelectedTransactions = R.not(R.isNil(findInputTransactionInTransactionList(inputTransactionsInTransaction(selectedTransactions))));

                // Find the candidate transaction in the blockchain (avoiding mining invalid transactions)
                let wasItFoundInBlocks = R.not(R.isNil(findInputTransactionInTransactionList(inputTransactionsInTransaction(transactionsInBlocks))));

                return wasItFoundInSelectedTransactions || wasItFoundInBlocks;
            }, transaction.data.inputs);

            // 交易验证和分类
            if (R.all(R.equals(false), transactionInputFoundAnywhere)) {
                if (transaction.type === 'regular' && negativeOutputsFound === 0) {
                    selectedTransactions.push(transaction);
                } else if (transaction.type === 'reward') {
                    selectedTransactions.push(transaction);
                } else if (negativeOutputsFound > 0) {
                    rejectedTransactions.push(transaction);
                }
            } else {
                rejectedTransactions.push(transaction);
            }
        }, candidateTransactions);

        console.info(`Selected ${selectedTransactions.length} candidate transactions with ${rejectedTransactions.length} being rejected.`);

        // Get the first two avaliable transactions, if there aren't TRANSACTIONS_PER_BLOCK, it's empty
        let transactions = R.defaultTo([], R.take(Config.TRANSACTIONS_PER_BLOCK, selectedTransactions));

        // Add fee transaction (1 satoshi per transaction)
        if (transactions.length > 0) {
            let feeTransaction = Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: 'fee',
                data: {
                    inputs: [],
                    outputs: [
                        {
                            amount: Config.FEE_PER_TRANSACTION * transactions.length, // satoshis format
                            address: feeAddress, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's a simple destination address 
                        }
                    ]
                }
            });

            transactions.push(feeTransaction);
        }

        // Add reward transaction of 50 coins
        if (rewardAddress != null) {
            let rewardTransaction = Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: 'reward',
                data: {
                    inputs: [],
                    outputs: [
                        {
                            amount: Config.MINING_REWARD, // satoshis format
                            address: rewardAddress, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's a simple destination address 
                        }
                    ]
                }
            });

            transactions.push(rewardTransaction);
        }

        return Block.fromJson({
            index,
            nonce: 0,
            previousHash,
            timestamp,
            transactions
        });
    }

    /* istanbul ignore next */
    static proveWorkFor(jsonBlock, difficulty) {
        let blockDifficulty = null;
        let start = process.hrtime();
        let block = Block.fromJson(jsonBlock);

        // 添加难度记录  
        block.difficulty = difficulty;

        // INFO: Every cryptocurrency has a different way to prove work, this is a simple hash sequence

        // Loop incrementing the nonce to find the hash at desired difficulty
        do {
            block.timestamp = new Date().getTime() / 1000;
            block.nonce++;
            block.hash = block.toHash();
            blockDifficulty = block.getDifficulty();
        } while (blockDifficulty >= difficulty);
        console.info(`Block found: time '${process.hrtime(start)[0]} sec' dif '${difficulty}' hash '${block.hash}' nonce '${block.nonce}'`);
        return block;
    }

    // 添加难度调整方法
    static getAdjustedDifficulty(latestBlock, blockchain){
        // 如果不是难度调整区块（不是10的倍数），直接返回上一个区块的难度  
        if ((latestBlock.index + 1) % Config.DIFFICULTY_ADJUSTMENT_INTERVAL !== 0) {  
            return latestBlock.difficulty;  
        }
        // 获取上一个难度调整区块（隔着 DIFFICULTY_ADJUSTMENT_INTERVAL 个区块）
        const prevAdjustmentBlock = blockchain.getBlockByIndex(
            Math.max(0, latestBlock.index - Config.DIFFICULTY_ADJUSTMENT_INTERVAL)
        );

        // 如果区块数量不足调整间隔，返回初始难度  
        if (prevAdjustmentBlock == null) {  
            return blockchain.getDifficulty();
        }
        // 计算预期的时间间隔
        const timeExpected = Config.BLOCK_GENERATION_INTERVAL * Config.DIFFICULTY_ADJUSTMENT_INTERVAL;
        // 计算实际花费的时间
        const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
        // console.log(`预期的时间间隔为：${timeExpected} \n 实际花费的时间：${timeTaken}`)
        // // 根据实际时间与预期时间的比较来调整难度  
        // if (timeTaken < timeExpected / Config.DIFFICULTY_ADJUSTMENT_FACTOR) {  
        //     // 如果生成太快，增加难度  
        //     return blockchain.getDifficulty() * Config.DIFFICULTY_ADJUSTMENT_FACTOR;  
        // } else if (timeTaken > timeExpected * Config.DIFFICULTY_ADJUSTMENT_FACTOR) {  
        //     // 如果生成太慢，降低难度  
        //     return blockchain.getDifficulty() / Config.DIFFICULTY_ADJUSTMENT_FACTOR;  
        // }  
        
        // // 如果在合理范围内，保持当前难度  
        // return blockchain.getDifficulty(); 

        // 添加容忍范围  
        const lowerBound = timeExpected / Config.DIFFICULTY_ADJUSTMENT_FACTOR;  
        const upperBound = timeExpected * Config.DIFFICULTY_ADJUSTMENT_FACTOR;

        let newDifficulty = latestBlock.difficulty;  

        console.log('Time metrics:', {  
            timeExpected,  
            timeTaken,  
            lowerBound,  
            upperBound  
        }); 
    
        // 添加最大调整幅度限制  
        if (timeTaken < timeExpected / Config.DIFFICULTY_ADJUSTMENT_FACTOR) {
            newDifficulty = Math.min(
            newDifficulty * Config.DIFFICULTY_ADJUSTMENT_FACTOR,
            newDifficulty * Config.MAX_DIFFICULTY_ADJUSTMENT
            );  
        } else if (timeTaken > timeExpected * Config.DIFFICULTY_ADJUSTMENT_FACTOR) {
            newDifficulty = Math.max(
            newDifficulty / Config.DIFFICULTY_ADJUSTMENT_FACTOR,  
            newDifficulty / Config.MAX_DIFFICULTY_ADJUSTMENT
            );
            // console.log(`Hello World!!!`)
        }
        console.log(`时间：${Date.now() / 1000}s, 最新的区块难度为: ${ latestBlock.difficulty }`)
        return newDifficulty;
    }
}

module.exports = Miner;
