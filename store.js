const db = require("./db");
class Store {
    messageStore = [
        {
            id: 1,
            userid: "U0190R4L6JH",
            title:
                "foobaafoobaa\n https://app.slack.com/client/T01926N9N66/D01AD7T0HQE/app",
            url: "https://google.com"
        },
        {
            id: 2,
            userid: "U0190R4L6JH",
            title: "please reviewplease reviewplease reviewplease review",
            url: "https://google.com"
        }
    ];
    messageUserStore = [
        { messageId: 1, userId: "U0190R4L6JH", status: 0 },
        { messageId: 2, userId: "U0190R4L6JH", status: 1 }
    ];
    users = [];

    constructor() {
        db.getAllMessages().then((retval) => {
            this.messageStore = [];
            retval.forEach((val) =>
                this.messageStore.push({
                    id: val.id,
                    userid: val.user_id,
                    title: val.title,
                    url: val.url
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

    getUsers() {
        return this.users;
    }

    setUsers(gotMembers) {
        this.users = [];
        gotMembers.forEach((element) => {
            this.users.push({ id: element.id, name: element.name });
        });
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

        this.messageUserStore.forEach((element) => {
            if (element.messageId == messageId && element.status == -1)
                element.status = 0;
        });
    }

    async setMessage(title, userId, url) {
        const id = await db.insertMessages(title, userId, url);
        this.messageStore.push({
            id: id,
            userid: userId,
            title: title,
            url: url
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
