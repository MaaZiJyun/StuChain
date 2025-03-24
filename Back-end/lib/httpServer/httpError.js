const ExtendedError = require('../util/extendedError');
const statuses = require('statuses');

// class HTTPError extends ExtendedError {
//     constructor(status, message, context, original) {
//         if (!message) message = status + ' - ' + statuses[status];
//         super(message, context, original);
//         if (status) this.status = status;
//     }

//     toJSON() {
//         const { status } = this;
//         return Object.assign({ status }, this);
//     }
// }

class HTTPError extends ExtendedError {
    constructor(status, message, context = {}, original = null) {
        // 如果没有提供消息，从定义的状态码对象中获取默认消息
        if (!message) message = `${status} - ${statuses[status]}`;
        super(message, context, original);
        if (status) this.status = status;
    }

    toJSON() {
        // 序列化错误信息，准备返回给客户端
        const { status, message, context, original } = this;
        return {
            status,
            message,
            context,
            originalMessage: original && original.message ? original.message : null
        };
    }
}

module.exports = HTTPError;
