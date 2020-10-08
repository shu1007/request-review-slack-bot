const db = require("./db");
class Store {
    messageStore = [];
    messageUserStore = [];

    constructor() {
        db.getAllMessages().then((retval) => {
            this.messageStore = [];
            retval.forEach((val) =>
                this.messageStore.push({
                    id: val.id,
                    userid: val.user_id,
                    title: val.title,
                    url: val.url,
                    channelId: val.channel_id,
                    messageTs: val.message_ts
                })
            );
        });
        db.getAllMessageUsers().then((retval) => {
            this.messageUserStore = [];
            retval.forEach((val) =>
                this.messageUserStore.push({
                    messageId: val.message_id,
                    userId: val.user_id,
                    status: val.status
                })
            );
        });
    }

    getMessage(messageId) {
        return this.messageStore.find((m) => m.id == messageId);
    }

    getMyMessage(userid) {
        return this.messageStore.filter((message) => message.userid === userid);
    }

    getRequests(userId) {
        return this.messageStore.filter((message) =>
            this.messageUserStore.find(
                (mu) =>
                    mu.messageId === message.id &&
                    mu.userId === userId &&
                    mu.status === 0
            )
        );
    }

    getUsersFromMessageId(messageId) {
        return this.messageUserStore.filter((mu) => mu.messageId == messageId);
    }

    async setStatus(messageId, userId, status) {
        await db.setStatus(messageId, userId, status);

        const index = this.messageUserStore.findIndex(
            (mu) => mu.messageId == messageId && mu.userId == userId
        );
        if (index != -1) {
            this.messageUserStore[index].status = status;
        }
    }

    async resetStatus(messageId) {
        await db.resetStatus(messageId);

        const userIds = [];
        this.messageUserStore.forEach((element) => {
            if (element.messageId == messageId && element.status == -1) {
                userIds.push(element.userId);
                element.status = 0;
            }
        });
        return userIds;
    }

    async setMessage(title, userId, url, channelId, messageTs) {
        const id = await db.insertMessages(
            title,
            userId,
            url,
            channelId,
            messageTs
        );

        this.messageStore.push({
            id: id,
            userid: userId,
            title: title,
            url: url,
            channelId: channelId,
            messageTs: messageTs
        });
        return id;
    }

    async setMessageUsers(messageId, userIds) {
        userIds.forEach(async (uid) => {
            await db.insertMessageUser(messageId, uid);

            this.messageUserStore.push({
                messageId: messageId,
                userId: uid,
                status: 0
            });
        });
    }

    async deleteMessage(messageId) {
        await db.deleteMesseges(messageId);

        this.messageStore = this.messageStore.filter((m) => m.id != messageId);
        this.messageUserStore = this.messageUserStore.filter(
            (mu) => mu.messageId != messageId
        );
    }
}

module.exports = new Store();
