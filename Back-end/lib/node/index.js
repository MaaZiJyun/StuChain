const superagent = require('superagent');
const Block = require('../blockchain/block');
const Blocks = require('../blockchain/blocks');
const Transactions = require('../blockchain/transactions');
const R = require('ramda');

class Node {
    constructor(host, port, peers, blockchain) {
        this.host = host;
        this.port = port;
        this.peers = [];
        this.blockchain = blockchain;
        this.hookBlockchain();
        this.connectToPeers(peers);
    }

    hookBlockchain() {
        // Hook blockchain so it can broadcast blocks or transactions changes
        this.blockchain.emitter.on('blockAdded', (block) => {
            this.broadcast(this.sendLatestBlock, block);
        });

        this.blockchain.emitter.on('transactionAdded', (newTransaction) => {
            this.broadcast(this.sendTransaction, newTransaction);
        });

        this.blockchain.emitter.on('blockchainReplaced', (blocks) => {
            this.broadcast(this.sendLatestBlock, R.last(blocks));
        });
    }

    connectToPeer(newPeer) {
        this.connectToPeers([newPeer]);
        return newPeer;
    }

    connectToPeers(newPeers) {
        // Connect to every peer
        let me = `http://${this.host}:${this.port}`;
        newPeers.forEach((peer) => {
            // If it already has that peer, ignore.
            if (!this.peers.find((element) => { return element.url == peer.url; }) && peer.url != me) {
                this.sendPeer(peer, { url: me });
                console.info(`Peer ${peer.url} added to connections.`);
                this.peers.push(peer);
                this.initConnection(peer);
                this.broadcast(this.sendPeer, peer);
            } else {
                console.info(`Peer ${peer.url} not added to connections, because I already have.`);
            }
        }, this);

    }

    initConnection(peer) {
        // It initially gets the latest block and all pending transactions
        this.getLatestBlock(peer);
        this.getTransactions(peer);
    }

    sendPeer(peer, peerToSend) {
        const URL = `${peer.url}/node/peers`;
        console.info(`Sending ${peerToSend.url} to peer ${URL}.`);
        return superagent
            .post(URL)
            .send(peerToSend)
            .catch((err) => {
                console.warn(`Unable to send me to peer ${URL}: ${err.message}`);
            });
    }

    getLatestBlock(peer) {
        const URL = `${peer.url}/blockchain/blocks/latest`;
        let self = this;
        console.info(`Getting latest block from: ${URL}`);
        return superagent
            .get(URL)
            .then((res) => {
                // Check for what to do with the latest block
                self.checkReceivedBlock(Block.fromJson(res.body));
            })
            .catch((err) => {
                console.warn(`Unable to get latest block from ${URL}: ${err.message}`);
            });
    }

    sendLatestBlock(peer, block) {
        const URL = `${peer.url}/blockchain/blocks/latest`;
        console.info(`Posting latest block to: ${URL}`);
        return superagent
            .put(URL)
            .send(block)
            .catch((err) => {
                console.warn(`Unable to post latest block to ${URL}: ${err.message}`);
            });
    }

    getBlocks(peer) {
        const URL = `${peer.url}/blockchain/blocks`;
        let self = this;
        console.info(`Getting blocks from: ${URL}`);
        return superagent
            .get(URL)
            .then((res) => {
                // Check for what to do with the block list
                self.checkReceivedBlocks(Blocks.fromJson(res.body));
            })
            .catch((err) => {
                console.warn(`Unable to get blocks from ${URL}: ${err.message}`);
            });
    }

    sendTransaction(peer, transaction) {
        const URL = `${peer.url}/blockchain/transactions`;
        console.info(`Sending transaction '${transaction.id}' to: '${URL}'`);
        return superagent
            .post(URL)
            .send(transaction)
            .catch((err) => {
                console.warn(`Unable to put transaction to ${URL}: ${err.message}`);
            });
    }

    getTransactions(peer) {
        const URL = `${peer.url}/blockchain/transactions`;
        let self = this;
        console.info(`Getting transactions from: ${URL}`);
        return superagent
            .get(URL)
            .then((res) => {
                self.syncTransactions(Transactions.fromJson(res.body));
            })
            .catch((err) => {
                console.warn(`Unable to get transations from ${URL}: ${err.message}`);
            });
    }

    getConfirmation(peer, transactionId) {
        // Get if the transaction has been confirmed in that peer
        const URL = `${peer.url}/blockchain/blocks/transactions/${transactionId}`;
        console.info(`Getting transactions from: ${URL}`);
        return superagent
            .get(URL)
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    getConfirmations(transactionId) {
        // Get from all peers if the transaction has been confirmed
        let foundLocally = this.blockchain.getTransactionFromBlocks(transactionId) != null ? true : false;
        return Promise.all(R.map((peer) => {
            return this.getConfirmation(peer, transactionId);
        }, this.peers))
            .then((values) => {
                return R.sum([foundLocally, ...values]);
            });
    }

    broadcast(fn, ...args) {
        // Call the function for every peer connected
        console.info('Broadcasting');
        this.peers.map((peer) => {
            fn.apply(this, [peer, ...args]);
        }, this);
    }

    syncTransactions(transactions) {
        // For each received transaction check if we have it, if not, add.
        R.forEach((transaction) => {
            let transactionFound = this.blockchain.getTransactionById(transaction.id);

            if (transactionFound == null) {
                console.info(`Syncing transaction '${transaction.id}'`);
                this.blockchain.addTransaction(transaction);
            }
        }, transactions);
    }

    checkReceivedBlock(block) {
        return this.checkReceivedBlocks([block]);
    }

    // added a function to calculate the difficulty of receiving blocks
    calculateTotalDifficulty(blocks) {
        return blocks.reduce((totalDifficulty, block) => totalDifficulty + block.difficulty, 0);
        // Iterate over all blocks and add up their difficulties
    }
    
    calculateTotalCumulativeDifficulty(blocks) {
        return blocks.reduce((totalDifficulty, block) => totalDifficulty + Math.pow(2, block.difficulty), 0);
    }

    checkReceivedBlocks(blocks) {
        // 按区块的索引排序，确保顺序正确
        const receivedBlocks = blocks.sort((b1, b2) => (b1.index - b2.index));
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = this.blockchain.getLastBlock();

        // 比较链的长度:
        // 检查接收到的区块的索引（即链的长度）与当前链的最后一个区块索引：
        // 如果接收到的区块索引小于或等于当前链的索引:
        // 确定接收到的链不是最新的，忽略该区块。

        if (latestBlockReceived.index <= latestBlockHeld.index) {
            console.info('Received blockchain is not longer than blockchain. Do nothing');
            return false;
        }
        console.info(`Blockchain possibly behind. We got: ${latestBlockHeld.index}, Peer got: ${latestBlockReceived.index}`);

        // 如果接收到的区块索引大于当前链的索引:
        // 继续比较链的难度。

        // 如果接收到的区块可以直接连接到本地链，则直接追加
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.info('Appending received block to our chain');
            this.blockchain.addBlock(latestBlockReceived);
            return true;
        }

        // 如果接收到的区块链只有一个区块，且无法直接连接，则请求完整链
        else if (receivedBlocks.length === 1) {
            console.info('Querying chain from our peers');
            this.broadcast(this.getBlocks);
            return null;
        }

        // 如果接收到的区块链比本地链长，检查累积难度
        // 比较链的难度:
        // 计算接收到的区块链的累积难度与当前链的累积难度：
        else {
            console.info('Received blockchain is longer than current blockchain. Checking cumulative difficulty...');
            const receivedChainDifficulty = this.calculateTotalCumulativeDifficulty(receivedBlocks);
            const currentChainDifficulty = this.blockchain.getTotalCumulativeDifficulty();

            // 如果接收到的链的累积难度更高:
            // 认为接收到的链更“正确”，进行替换操作。
            // 将当前链替换为接收到的链。
            if (receivedChainDifficulty > currentChainDifficulty) {
                console.info('Replacing current blockchain with received blockchain');
                this.blockchain.replaceChain(receivedBlocks);
                return true;
            }
            // 如果两者的累积难度相同或接收到的链的难度较低:
            // 认为当前链更“正确”，保留现有链。
            else {
                console.info('Received blockchain has lower cumulative difficulty. Do nothing.');
                return false;
            }
        }
    }
}

module.exports = Node;
