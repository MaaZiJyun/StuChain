const Block = require('./block');
const R = require('ramda');

// Class of the Block
class Blocks extends Array {
    static fromJson(data) {
        let blocks = new Blocks();
        R.forEach((block) => { blocks.push(Block.fromJson(block)); }, data);
        return blocks;
    }
}

module.exports = Blocks;