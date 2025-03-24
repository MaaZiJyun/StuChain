const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const Transactions = require('./transactions');
const Config = require('../config');

/*
{ // Block
    "index": 0, // (first block: 0)
    "previousHash": "0", // (hash of previous block, first block is 0) (64 bytes)
    "timestamp": 1465154705, // number of seconds since January 1, 1970
    "nonce": 0, // nonce used to identify the proof-of-work step.
    "transactions": [ // list of transactions inside the block
        { // transaction 0
            "id": "63ec3ac02f...8d5ebc6dba", // random id (64 bytes)
            "hash": "563b8aa350...3eecfbd26b", // hash taken from the contents of the transaction: sha256 (id + data) (64 bytes)
            "type": "regular", // transaction type (regular, fee, reward)
            "data": {
                "inputs": [], // list of input transactions
                "outputs": [] // list of output transactions
            }
        }
    ],
    "hash": "c4e0b8df46...199754d1ed" // hash taken from the contents of the block: sha256 (index + previousHash + timestamp + nonce + transactions) (64 bytes)
}
*/

class Block {
    // 区块的基本结构
    constructor(index, previousHash, timestamp, transactions, nonce, difficulty) {  
        this.index = index;  
        this.previousHash = previousHash;  
        this.timestamp = timestamp;  
        this.transactions = transactions;  
        this.nonce = nonce;  
        this.difficulty = difficulty; // 新增难度属性  
        this.hash = this.toHash();  
    }
    // 在哈希计算中加入 difficulty 
    toHash() {
        // INFO: There are different implementations of the hash algorithm, for example: https://en.bitcoin.it/wiki/Hashcash
        return CryptoUtil.hash(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.transactions) + 
            this.nonce +
            this.difficulty
        );
    }

    getDifficulty() {
        // // 14 is the maximum precision length supported by javascript
        // return parseInt(this.hash.substring(0, 14), 16);
        // 修改难度计算方法  
        // 将哈希值转换为数字并与当前区块的难度目标进行比较  
        const hashInBinary = this.hexToBinary(this.hash);  
        /* 计算前导零的数量
            使用正则表达式查找前导0：
            - ^ 表示从字符串开始匹配
            - 0+ 表示匹配一个或多个连续的零
        */
        const leadingZeros = hashInBinary.match(/^0+/);
        // 如果找到前导零，返回其长度，如果没有前导零，返回 0 。
        return leadingZeros ? leadingZeros[0].length : 0;
    }

    // 辅助方法：将16进制转换为二进制字符串，每个16进制字符转换为4位二进制。
    hexToBinary(hex) {  
        let binary = '';  
        for(let i = 0; i < hex.length; i++) {  
            const chunk = parseInt(hex[i], 16).toString(2).padStart(4, '0');  
            binary += chunk;  
        }  
        return binary;  
    }

    // 用于创建和返回创世区块。
    static get genesis() {
        // // The genesis block is fixed
        // return Block.fromJson(Config.genesisBlock);

        // 修改创世区块，添加初始难度  
        const genesisBlock = Block.fromJson({
            // 展开运算符(...) 用来复制 Config.genesisBlock 的所有属性
            ...Config.genesisBlock,  
            difficulty: Config.INITIAL_DIFFICULTY || 0 // 需要在 Config 中定义初始难度  
        });  
        return genesisBlock;
    }

    // 将 JSON 数据转换为区块对象。
    static fromJson(data) {
        // let block = new Block();
        // R.forEachObjIndexed((value, key) => {
        //     if (key == 'transactions' && value) {
        //         block[key] = Transactions.fromJson(value);
        //     } else {
        //         block[key] = value;
        //     }
        // }, data);

        // 使用构造函数创建区块  
        const block = new Block(  
            data.index,  
            data.previousHash,  
            data.timestamp,  
            data.transactions ? Transactions.fromJson(data.transactions) : [],  
            data.nonce || 0,  
            data.difficulty || 0  // 如果没有提供难度，默认为0  
        );
        // block.hash = block.toHash();
        // 如果提供了hash，使用提供的hash  
        if (data.hash) {
            block.hash = data.hash;
        }
        return block;
    }
    // 新增方法：检查区块是否满足难度要求  
    isHashValid() {
        return this.getDifficulty() >= this.difficulty;
    }

    // 新增方法：时间戳验证
    validateTimestamp(previousBlock) {  
        const currentTime = Math.floor(Date.now() / 1000);  
        if (this.timestamp < previousBlock.timestamp - Config.MAX_TIMESTAMP_DIFFERENCE) return false;  
        if (this.timestamp > currentTime + Config.MAX_TIMESTAMP_DIFFERENCE) return false;  
    return true;  
}

}

module.exports = Block;