class Store {
    messageStore = [
        {
            id: 1,
            userid: "U0190R4L6JH",
            message:
                "hogehogehogehogehoeghoge\n https://app.slack.com/client/T01926N9N66/D01AD7T0HQE/app",
            url: "https://google.com"
        },
        {
            id: 2,
            userid: "U0190R4L6JH",
            message: "please reviewplease reviewplease reviewplease review",
            url: "https://google.com"
        }
    ];
    messageUserStore = [
        { messageId: 1, userId: "U0190R4L6JH", status: 0 },
        { messageId: 2, userId: "U0190R4L6JH", status: 1 }
    ];
    users = [];

    constructor() {}

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

    setStatus(messageId, userId, status) {
        const index = this.messageUserStore.findIndex(
            (mu) => mu.messageId == messageId && mu.userId == userId
        );
        if (index != -1) {
            this.messageUserStore[index].status = status;
        }
    }

    resetStatus(messageId) {
        this.messageUserStore.forEach((element) => {
            if (element.messageId == messageId) element.status = 0;
        });
    }

    deleteMessage(messageId) {
        this.messageStore = this.messageStore.filter((m) => m.id != messageId);
        this.messageUserStore = this.messageUserStore.filter(
            (mu) => mu.messageId != messageId
        );
    }
}

module.exports = new Store();
