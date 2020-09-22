let messageStore = [
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
let messageUserStore = [
    { messageId: 1, userId: "U0190R4L6JH", checkFlg: false },
    { messageId: 1, userId: "U0190R4L6JH", checkFlg: false },
    { messageId: 2, userId: "U0190R4L6JH", checkFlg: true }
];
let users = [];

exports.getMyTask = function (userid) {
    return messageStore.filter((message) => message.userid === userid);
};

exports.getRequests = function (userId) {
    return messageStore.filter((message) =>
        messageUserStore.find(
            (mu) =>
                mu.messageId === message.id &&
                mu.userId === userId &&
                !mu.checkFlg
        )
    );
};

exports.getUsersFromMessageId = (messageId) => {
    return messageUserStore.filter((mu) => mu.messageId == messageId);
};

exports.getUsers = () => {
    return users;
};

exports.setUsers = (gotMembers) => {
    users = [];
    gotMembers.forEach((element) => {
        users.push({ id: element.id, name: element.name });
    });
};
