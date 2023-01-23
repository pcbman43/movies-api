const uuIdv4 = require('uuid').v4;
module.exports = {
    create: function (userId) {
        const sessionId = uuIdv4();
        return {
            id: sessionId,
            userId: userId,
            createdAt: new Date()
        };
    }

}

