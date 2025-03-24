const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');

class Wallet {
    constructor() {
        this.id = null; // 钱包的唯一标识符
        this.userID = null; // 用户的ID
        this.passwordHash = null;   // 钱包相关密码的哈希值
        this.secret = null; // 钱包的密码种子
        this.keyPairs = []; // 密钥对数组
    }

    /*  生成一个新的钱包地址，并返回该地址的公钥。
        通过创建新的密钥对实现这一点，并将该密钥对存储在 keyPairs 数组中。*/
    generateAddress() {     //（加密钱包地址的生成）
        // If secret is null means it is a brand new wallet
        if (this.secret == null) {
            // 调用 generateSecret() 方法，这个方法会基于 passwordHash 产生一个独特的秘密种子并存储在 secret 属性中。
            this.generateSecret();
        }
        
        /* 获取最后一个密钥对:
        · 使用 ramda 库的 last 函数从 keyPairs 数组中获取最后一个密钥对（如果存在）。
        · 如果钱包尚未生成密钥对，lastKeyPair 将为 null。*/
        let lastKeyPair = R.last(this.keyPairs);
        
        // Generate next seed based on the first secret or a new secret from the last key pair.
        /*根据情况决定生成种子的方式：
        如果 lastKeyPair 为 null（即没有已有密钥对），则使用钱包的 secret 作为种子。
        如果存在 lastKeyPair，则从中提取 secretKey，使用该密钥生成一个新的密码种子
        R.propOr(defaultValue, property, object): 3个参数分别为：默认值（如果对象中找不到指定的属性，将返回这个值）；需要获取的属性名；从中提取属性的对象。
        */
        let seed = (lastKeyPair == null ?  this.secret : CryptoEdDSAUtil.generateSecret(R.propOr(null, 'secretKey', lastKeyPair)));
        // 根据密码种子生成新密钥对:
        let keyPairRaw = CryptoEdDSAUtil.generateKeyPairFromSecret(seed);
        /*  构造一个新的密钥对对象
            · index: 新密钥对在数组中的索引（从1开始计数）。
            · secretKey: 使用工具库方法将原始密钥对的 secretKey 转换为十六进制格式。
            · publicKey: 同样转换其公钥为十六进制格式。*/
        let newKeyPair = {
            index: this.keyPairs.length + 1,    // 新密钥对在数组中的索引（从1开始计数）。
            secretKey: CryptoEdDSAUtil.toHex(keyPairRaw.getSecret()),   // 将原始密钥对的 secretKey 转换为十六进制格式。
            publicKey: CryptoEdDSAUtil.toHex(keyPairRaw.getPublic())    // 转换其公钥为十六进制格式。
        };
        this.keyPairs.push(newKeyPair);     // 将新的密钥对添加到 keyPairs 数组中。
        return newKeyPair.publicKey;        // 返回新生成的密钥对中的公钥作为新地址。
    }

    generateSecret() {  // 生成并返回钱包的 secret。
        this.secret = CryptoEdDSAUtil.generateSecret(this.passwordHash);
        return this.secret;
    }

    getAddressByIndex(index) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('index', index), this.keyPairs));
    }

    getAddressByPublicKey(publicKey) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('publicKey', publicKey), this.keyPairs));
    }

    getSecretKeyByAddress(address) {
        return R.propOr(null, 'secretKey', R.find(R.propEq('publicKey', address), this.keyPairs));
    }

    getAddresses() {
        return R.map(R.prop('publicKey'), this.keyPairs);
    }

    // static fromPassword(password) {
    //     let wallet = new Wallet();
    //     wallet.id = CryptoUtil.randomId();
    //     wallet.passwordHash = CryptoUtil.hash(password);
    //     return wallet;
    // }

    static fromPasswordAndUserID(password, userID) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.userID = userID;
        wallet.passwordHash = CryptoUtil.hash(password);
        return wallet;
    }

    static fromHash(passwordHash) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.passwordHash = passwordHash;
        return wallet;
    }

    static fromJson(data) {
        let wallet = new Wallet();
        R.forEachObjIndexed((value, key) => { wallet[key] = value; }, data);
        return wallet;
    }
}

module.exports = Wallet;