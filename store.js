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
        { messageId: 1, userId: "U0190R4L6JH", checkFlg: false },
        { messageId: 1, userId: "U0190R4L6JH", checkFlg: false },
        { messageId: 2, userId: "U0190R4L6JH", checkFlg: true }
    ];
    users = [];

    constructor() {}

    getMyTask = function (userid) {
        return this.messageStore.filter((message) => message.userid === userid);
    };

    getRequests = function (userId) {
        return this.messageStore.filter((message) =>
            this.messageUserStore.find(
                (mu) =>
                    mu.messageId === message.id &&
                    mu.userId === userId &&
                    !mu.checkFlg
            )
        );
    };

    getUsersFromMessageId = (messageId) => {
        return this.messageStore.filter((mu) => mu.messageId == messageId);
    };

    getUsers = () => {
        return this.users;
    };

    setUsers = (gotMembers) => {
        this.users = [];
        gotMembers.forEach((element) => {
            this.users.push({ id: element.id, name: element.name });
        });
    };
}

module.exports = new Store();
