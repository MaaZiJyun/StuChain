const EventEmitter = require('events');
const R = require('ramda');
const Db = require('../util/db');
const Blocks = require('./blocks');
const Block = require('./block');
const Transactions = require('./transactions');
const TransactionAssertionError = require('./transactionAssertionError');
const BlockAssertionError = require('./blockAssertionError');
const BlockchainAssertionError = require('./blockchainAssertionError');
const Config = require('../config');

// Database settings
const BLOCKCHAIN_FILE = 'blocks.json';
const TRANSACTIONS_FILE = 'transactions.json';

class Blockchain {
    constructor(dbName) {
        this.blocksDb = new Db('data/' + dbName + '/' + BLOCKCHAIN_FILE, new Blocks());
        this.transactionsDb = new Db('data/' + dbName + '/' + TRANSACTIONS_FILE, new Transactions());

        // INFO: In this implementation the database is a file and every time data is saved it rewrites the file, probably it should be a more robust database for performance reasons
        this.blocks = this.blocksDb.read(Blocks);
        this.transactions = this.transactionsDb.read(Transactions);

        // Some places uses the emitter to act after some data is changed
        this.emitter = new EventEmitter();
        this.init();
    }

    init() {
        // Create the genesis block if the blockchain is empty
        if (this.blocks.length == 0) {
            console.info('Blockchain empty, adding genesis block');
            this.blocks.push(Block.genesis);
            this.blocksDb.write(this.blocks);
        }

        // Remove transactions that are in the blockchain
        console.info('Removing transactions that are in the blockchain');
        R.forEach(this.removeBlockTransactionsFromTransactions.bind(this), this.blocks);
    }

    getAllBlocks() {
        return this.blocks;
    }

    getBlockByIndex(index) {
        return R.find(R.propEq('index', index), this.blocks);
    }

    getBlockByHash(hash) {
        return R.find(R.propEq('hash', hash), this.blocks);
    }

    getLastBlock() {
        return R.last(this.blocks);
    }

    getTotalDifficulty() {
        // Ensure that blocks are available
        if (!this.blocks || this.blocks.length === 0) {
            return 0;
        }
        // Assuming each block has a available difficulty
        return this.blocks.reduce((totalDifficulty, block) => {
            return totalDifficulty + (block.difficulty || 0);
        }, 0);
    }

    // Calculate cumulative difficulty
    getTotalCumulativeDifficulty() {
        // Ensure that blocks are available
        if (!this.blocks || this.blocks.length === 0) {
            return 0;
        }
        // Assuming each block has a available difficulty
        return this.blocks.reduce((totalDifficulty, block) => {
            return totalDifficulty + Math.pow(2, (block.difficulty || 0));
        }, 0);
    }

    getDifficulty(index) {
        // Calculates the difficulty based on the index since the difficulty value increases every X blocks.
        // 如果是创世区块或索引为0，返回初始难度
        if (index === 0) {
            return Config.INITIAL_DIFFICULTY;
        }

        const latestBlock = this.getLastBlock();
        // 如果区块数量不足调整间隔，返回当前难度  
        if (latestBlock.index < Config.DIFFICULTY_ADJUSTMENT_INTERVAL) {
            return latestBlock.difficulty;
        }

        // 只在难度调整区块进行调整  
        if (index % Config.DIFFICULTY_ADJUSTMENT_INTERVAL !== 0) {
            return latestBlock.difficulty;
        }
        // 添加难度边界检查  
        const newDifficulty = latestBlock.difficulty;

        // console.log(`时间：${Date.now()}, 最新的区块难度为: ${ latestBlock.difficulty }`)

        return Math.max(Math.min(newDifficulty, Config.MAX_DIFFICULTY), Config.MIN_DIFFICULTY);
        //return latestBlock.difficulty;
        // return Config.pow.getDifficulty(this.blocks, index);
    }

    getAllTransactions() {
        return this.transactions;
    }

    getTransactionById(id) {
        return R.find(R.propEq('id', id), this.transactions);
    }

    getTransactionFromBlocks(transactionId) {
        return R.find(R.compose(R.find(R.propEq('id', transactionId)), R.prop('transactions')), this.blocks);
    }

    replaceChain(newBlockchain) {
        // It doesn't make sense to replace this blockchain by a smaller one
        if (newBlockchain.length <= this.blocks.length) {
            console.error('Blockchain shorter than the current blockchain');
            throw new BlockchainAssertionError('Blockchain shorter than the current blockchain');
        }

        // Verify if the new blockchain is correct
        this.checkChain(newBlockchain);

        // Get the blocks that diverges from our blockchain
        console.info('Received blockchain is valid. Replacing current blockchain with received blockchain');
        let newBlocks = R.takeLast(newBlockchain.length - this.blocks.length, newBlockchain);

        // Add each new block to the blockchain
        R.forEach((block) => {
            this.addBlock(block, false);
        }, newBlocks);

        this.emitter.emit('blockchainReplaced', newBlocks);
    }

    checkChain(blockchainToValidate) {
        // Check if the genesis block is the same
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(Block.genesis)) {
            console.error('Genesis blocks aren\'t the same');
            throw new BlockchainAssertionError('Genesis blocks aren\'t the same');
        }

        // Compare every block to the previous one (it skips the first one, because it was verified before)
        try {
            for (let i = 1; i < blockchainToValidate.length; i++) {
                this.checkBlock(blockchainToValidate[i], blockchainToValidate[i - 1], blockchainToValidate);
            }
        } catch (ex) {
            console.error('Invalid block sequence');
            throw new BlockchainAssertionError('Invalid block sequence', null, ex);
        }
        return true;
    }

    addBlock(newBlock, emit = true) {
        // It only adds the block if it's valid (we need to compare to the previous one)
        if (this.checkBlock(newBlock, this.getLastBlock())) {
            this.blocks.push(newBlock);
            this.blocksDb.write(this.blocks);

            // After adding the block it removes the transactions of this block from the list of pending transactions
            this.removeBlockTransactionsFromTransactions(newBlock);

            console.info(`Block added: ${newBlock.hash}`);
            console.debug(`Block added: ${JSON.stringify(newBlock)}`);
            if (emit) this.emitter.emit('blockAdded', newBlock);

            return newBlock;
        }
    }

    addTransaction(newTransaction, emit = true) {
        // It only adds the transaction if it's valid
        if (this.checkTransaction(newTransaction, this.blocks)) {
            this.transactions.push(newTransaction);
            this.transactionsDb.write(this.transactions);

            console.info(`Transaction added: ${newTransaction.id}`);
            console.debug(`Transaction added: ${JSON.stringify(newTransaction)}`);
            if (emit) this.emitter.emit('transactionAdded', newTransaction);

            return newTransaction;
        }
    }

    removeBlockTransactionsFromTransactions(newBlock) {
        this.transactions = R.reject((transaction) => { return R.find(R.propEq('id', transaction.id), newBlock.transactions); }, this.transactions);
        this.transactionsDb.write(this.transactions);
    }

    checkBlock(newBlock, previousBlock, referenceBlockchain = this.blocks) {
        const blockHash = newBlock.toHash();

        if (previousBlock.index + 1 !== newBlock.index) { // Check if the block is the last one
            console.error(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
            throw new BlockAssertionError(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
        } else if (previousBlock.hash !== newBlock.previousHash) { // Check if the previous block is correct
            console.error(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
            throw new BlockAssertionError(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
        } else if (blockHash !== newBlock.hash) { // Check if the hash is correct
            console.error(`Invalid hash: expected '${blockHash}' got '${newBlock.hash}'`);
            throw new BlockAssertionError(`Invalid hash: expected '${blockHash}' got '${newBlock.hash}'`);
        } else if (newBlock.getDifficulty() >= this.getDifficulty(newBlock.index)) { // If the difficulty level of the proof-of-work challenge is correct
            console.error(`Invalid proof-of-work difficulty: expected '${newBlock.getDifficulty()}' to be smaller than '${this.getDifficulty(newBlock.index)}'`);
            throw new BlockAssertionError(`Invalid proof-of-work difficulty: expected '${newBlock.getDifficulty()}' be smaller than '${this.getDifficulty()}'`);
        }

        // INFO: Here it would need to check if the block follows some expectation regarging the minimal number of transactions, value or data size to avoid empty blocks being mined.

        // For each transaction in this block, check if it is valid
        R.forEach(this.checkTransaction.bind(this), newBlock.transactions, referenceBlockchain);

        // Check if the sum of output transactions are equal the sum of input transactions + MINING_REWARD (representing the reward for the block miner)
        let sumOfInputsAmount = R.sum(R.flatten(R.map(R.compose(R.map(R.prop('amount')), R.prop('inputs'), R.prop('data')), newBlock.transactions))) + Config.MINING_REWARD;
        let sumOfOutputsAmount = R.sum(R.flatten(R.map(R.compose(R.map(R.prop('amount')), R.prop('outputs'), R.prop('data')), newBlock.transactions)));

        let isInputsAmountGreaterOrEqualThanOutputsAmount = R.gte(sumOfInputsAmount, sumOfOutputsAmount);

        if (!isInputsAmountGreaterOrEqualThanOutputsAmount) {
            console.error(`Invalid block balance: inputs sum '${sumOfInputsAmount}', outputs sum '${sumOfOutputsAmount}'`);
            throw new BlockAssertionError(`Invalid block balance: inputs sum '${sumOfInputsAmount}', outputs sum '${sumOfOutputsAmount}'`, { sumOfInputsAmount, sumOfOutputsAmount });
        }

        // Check if there is double spending
        let listOfTransactionIndexInputs = R.flatten(R.map(R.compose(R.map(R.compose(R.join('|'), R.props(['transaction', 'index']))), R.prop('inputs'), R.prop('data')), newBlock.transactions));
        let doubleSpendingList = R.filter((x) => x >= 2, R.map(R.length, R.groupBy(x => x)(listOfTransactionIndexInputs)));

        if (R.keys(doubleSpendingList).length) {
            console.error(`There are unspent output transactions being used more than once: unspent output transaction: '${R.keys(doubleSpendingList).join(', ')}'`);
            throw new BlockAssertionError(`There are unspent output transactions being used more than once: unspent output transaction: '${R.keys(doubleSpendingList).join(', ')}'`);
        }

        // Check if there is only 1 fee transaction and 1 reward transaction;
        let transactionsByType = R.countBy(R.prop('type'), newBlock.transactions);
        if (transactionsByType.fee && transactionsByType.fee > 1) {
            console.error(`Invalid fee transaction count: expected '1' got '${transactionsByType.fee}'`);
            throw new BlockAssertionError(`Invalid fee transaction count: expected '1' got '${transactionsByType.fee}'`);
        }

        if (transactionsByType.reward && transactionsByType.reward > 1) {
            console.error(`Invalid reward transaction count: expected '1' got '${transactionsByType.reward}'`);
            throw new BlockAssertionError(`Invalid reward transaction count: expected '1' got '${transactionsByType.reward}'`);
        }

        return true;
    }

    checkTransaction(transaction, referenceBlockchain = this.blocks) {

        // Check the transaction
        transaction.check(transaction);

        // Verify if the transaction isn't already in the blockchain
        let isNotInBlockchain = R.all((block) => {
            return R.none(R.propEq('id', transaction.id), block.transactions);
        }, referenceBlockchain);

        if (!isNotInBlockchain) {
            console.error(`Transaction '${transaction.id}' is already in the blockchain`);
            throw new TransactionAssertionError(`Transaction '${transaction.id}' is already in the blockchain`, transaction);
        }

        // Verify if all input transactions are unspent in the blockchain
        let isInputTransactionsUnspent = R.all(R.equals(false), R.flatten(R.map((txInput) => {
            return R.map(
                R.pipe(
                    R.prop('transactions'),
                    R.map(R.pipe(
                        R.path(['data', 'inputs']),
                        R.contains({ transaction: txInput.transaction, index: txInput.index })
                    ))
                ), referenceBlockchain);
        }, transaction.data.inputs)));

        if (!isInputTransactionsUnspent) {
            console.error(`Not all inputs are unspent for transaction '${transaction.id}'`);
            throw new TransactionAssertionError(`Not all inputs are unspent for transaction '${transaction.id}'`, transaction.data.inputs);
        }

        return true;
    }

    // 该函数用于获取指定地址的未花费交易输出
    getUnspentTransactionsForAddress(address) {
        // 内部函数 selectTxs: 旨在筛选出与指定地址相关的交易输入和输出。它通过对每个交易对象的输入和输出进行遍历，将相关的数据收集起来。
        const selectTxs = (transaction) => {
            let index = 0;  // 用于指示当前遍历到的交易输出在整个输出列表中的位置。
            // Create a list of all transactions outputs found for an address (or all).
            R.forEach((txOutput) => {   // 使用了函数式编程库的 forEach 方法，遍历每个交易的输出列表 transaction.data.outputs。
                // 对于每个输出 txOutput，如果指定了 address 且输出的地址与目标地址匹配，则将该交易输出的信息添加到 txOutputs 列表中。
                if (address && txOutput.address == address) {
                    // 每个匹配的交易输出保存的信息包括交易ID、输出索引、金额和地址。
                    txOutputs.push({
                        transaction: transaction.id,
                        index: index,
                        amount: txOutput.amount,
                        address: txOutput.address
                    });
                }
                index++;
            }, transaction.data.outputs);

            // Create a list of all transactions inputs found for an address (or all).            
            R.forEach((txInput) => {    // 遍历所有交易的输入列表 transaction.data.inputs。
                if (address && txInput.address != address) return;
                // 如果没有指定 address 或者输入地址匹配，则将该交易输入的信息添加到 txInputs 列表中。
                txInputs.push({
                    transaction: txInput.transaction,
                    index: txInput.index,
                    amount: txInput.amount,
                    address: txInput.address
                });
            }, transaction.data.inputs);
        };

        // Considers both transactions in block and unconfirmed transactions (enabling transaction chain)
        let txOutputs = [];     // 初始化一个空数组 txOutputs，用于存储与指定地址相关的交易输出信息。
        let txInputs = [];      // 初始化另一个空数组 txInputs，用于存储与指定地址相关的交易输入信息。
        /*  处理区块中已确认的交易:
        this.blocks 是一个包含多个区块的数组。
        对于每个区块，首先提取其中的交易列表（通过 R.prop('transactions')），然后对每笔交易应用 selectTxs 函数。
        selectTxs 的作用是从每笔交易中筛选出与指定地址相关的输入和输出，并分别将其添加到 txInputs 和 txOutputs 中。
        */
        R.forEach(R.pipe(R.prop('transactions'), R.forEach(selectTxs)), this.blocks);
        /*  处理未确认的交易:
        this.transactions 是一个包含未确认交易的列表。
        对每个未确认交易，同样应用 selectTxs 函数，以提取相关的输入和输出信息。
        */
        R.forEach(selectTxs, this.transactions);
        // Cross both lists and find transactions outputs without a corresponding transaction input
        // 交叉检查两个列表，找出没有对应交易输入的交易输出。
        let unspentTransactionOutput = [];  // 初始化一个新的数组 unspentTransactionOutput，用于存储未花费的交易输出。
        // utxolist = txoutput list - txinputlist
        R.forEach((txOutput) => {   // 遍历 txOutputs 数组中的每个交易输出 txOutput
            /*  对于每个交易输出，检查是否在 txInputs 中找不到对应的输入（即没有交易输入消耗这个输出）。
            · 检查是通过 R.any 来实现的，R.any 遍历 txInputs，检查 txInputs 数组中的任何一个元素（即 txInput）是否
            与当前遍历的 txOutput 具有相同的 transaction 和 index。如果找到了这样的交易输入，则返回 true（否则返回 false），
            说明该交易输出已经被消费，因此不再是未花费输出。
            · R.any 是 Ramda 提供的一个函数，它用于检查数组中的元素是否至少有一个满足给定的条件，返回一个布尔值。
            */
            if (!R.any((txInput) => txInput.transaction == txOutput.transaction && txInput.index == txOutput.index, txInputs)) {
                unspentTransactionOutput.push(txOutput);
            }
        }, txOutputs);

        return unspentTransactionOutput;
    }
}

module.exports = Blockchain;
