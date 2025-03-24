const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
const ArgumentError = require('../util/argumentError');
const Transaction = require('../blockchain/transaction');

class TransactionBuilder {
    constructor() {
        this.listOfUTXO = null;
        this.outputAddress = null;
        this.totalAmount = null;
        this.changeAddress = null;
        this.feeAmount = 0;
        this.secretKey = null;
        this.type = 'regular';
        this.timestamp = Date.now();
        this.stuId = null;
        this.teacherId = null;
        this.eventId = null;
        this.remark = null; // 新增字段：备注信息
        this.deadline = null; // 新增字段：截止时间
    }

    from(listOfUTXO) {
        this.listOfUTXO = listOfUTXO;
        return this;
    }

    to(address, amount) {
        this.outputAddress = address;
        this.totalAmount = amount;
        return this;
    }

    change(changeAddress) {
        this.changeAddress = changeAddress;
        return this;
    }

    fee(amount) {
        this.feeAmount = amount;
        return this;
    }

    sign(secretKey) {
        this.secretKey = secretKey;
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    setTimestamp(timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    setStuId(stuId) {   // New setStuId method
        this.stuId = stuId;
        return this;
    }

    setTeacherId(teacherId) {   // 新增 setTeacherId 方法
        this.teacherId = teacherId;
        return this;
    }

    setEventId(eventId) {
        this.eventId = eventId;
        return this;
    }

    setRemark(remark) { // 新增方法：设置备注信息
        this.remark = remark;
        return this;
    }

    setDeadline(deadline) { // 新增方法：设置截止时间
        this.deadline = deadline;
        return this;
    }


    build() {
        // Check required information
        if (this.listOfUTXO == null) throw new ArgumentError("A list of unspent output transactions (UTXOs) is required.");
        if (this.outputAddress == null) throw new ArgumentError("The destination address is required.");
        // if (this.totalAmount == null) throw new ArgumentError("The transaction amount is required.");
        if (this.totalAmount == null) this.amount = 0;
        if (this.changeAddress == null) throw new ArgumentError("The change address is required.");
        if (this.secretKey == null) throw new ArgumentError("A secret key is required to sign the transaction.");
        if (this.stuId == null) throw new ArgumentError("The student ID (StuId) is required."); // Ensure StuId is set
        if (this.deadline == null) throw new ArgumentError("A deadline is required for the transaction.");

        // Calculate the change amount 
        // Change Amount: 是指在完成交易后，扣除交易总额和交易费用后剩余的金额，需要返回给交易发起方。
        /*
        1. R.pluck 是 Ramda 提供的一个函数，用于在对象数组中提取每个对象的指定属性。
            在这里，它被用来从 this.listOfUTXO 中提取每个 UTXO（未花费交易输出）的 amount 属性。this.listOfUTXO 是一个包含多个 UTXO 的数组。
            结果是一个数字数组，每个数字代表一个 UTXO 的金额。
        2. R.sum 是 Ramda 的另一个函数，用于计算数组中所有数字的和。
            在这里，它被用来计算 this.listOfUTXO 中所有 UTXO 金额的总和，结果存储在 totalAmountOfUTXO 变量中。这代表了可用来执行交易的总金额。
        */
        let totalAmountOfUTXO = R.sum(R.pluck('amount', this.listOfUTXO));  // 计算 UTXO 的总金额
        /*  找零金额 = UTXO 的总金额 - 交易的总额 - 交易费用
                1. changeAmount 是找零金额，即交易完成后剩余并返还给发起方的金额。
                2. totalAmountOfUTXO 是 UTXO 的总金额，代表交易发起方在区块链上的总可用金额。
                3. this.totalAmount 是交易的总额，即应该从发起方的总金额中扣除的部分，用于支付交易。
                4. this.feeAmount 是交易费用，通常用于激励矿工打包交易。
        
         */
        let changeAmount = totalAmountOfUTXO - this.totalAmount - this.feeAmount;

        // For each transaction input, calculate the hash of the input and sign the data.
        let inputs = R.map((utxo) => {  // 使用 R.map 函数，对数组 this.listOfUTXO 中的每一个元素 utxo 执行括号中的回调函数，并返回一个新的数组 inputs。
            // 计算 utxo 的交易输入哈希：
            let txiHash = CryptoUtil.hash({
                transaction: utxo.transaction,
                index: utxo.index,
                address: utxo.address,
            });
            // 生成签名：使用生成的哈希（即 txiHash）计算签名，并将此签名赋值给 utxo 的 signature 属性：
            utxo.signature = CryptoEdDSAUtil.signHash(CryptoEdDSAUtil.generateKeyPairFromSecret(this.secretKey), txiHash);
            return utxo;
        }, this.listOfUTXO);

        // 初始化一个空数组 outputs，用于存储交易的输出信息。每个输出信息包含接收方的地址和金额。
        let outputs = [];

        // Add target receiver
        outputs.push({  // 使用 push 方法将目标接收者的信息添加到 outputs 数组中。
            amount: this.totalAmount,   // 表示交易的金额，即接收者将收到的资金。
            address: this.outputAddress // 表示接收者的地址，表示资金的接收方。
        });

        // Add change amount if positive
        // if (changeAmount > 0) {
        //     outputs.push({
        //         amount: changeAmount,
        //         address: this.changeAddress
        //     });
        // } else {
        //     throw new ArgumentError("The sender does not have enough balance to complete the transaction.");
        // }

        // Return the Transaction object with additional fields
        return Transaction.fromJson({   // 使用 Transaction.fromJson 方法创建并返回一个新的交易对象。
            id: CryptoUtil.randomId(64),
            hash: null,
            type: this.type,
            timestamp: this.timestamp,
            transactionFee: this.feeAmount,
            stuId: this.stuId,
            teacherId: this.teacherId,
            eventId: this.eventId,
            remark: this.remark, // 新增：备注信息
            deadline: this.deadline, // 新增：截止时间
            data: {
                inputs: inputs,
                outputs: outputs
            }
        });
    }
}

module.exports = TransactionBuilder;
