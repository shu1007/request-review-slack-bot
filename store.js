let messageStore = [
    { id: 1, userid: "U0190R4L6JH", message: "hogehogehogehogehoeghoge", completeflg: false }
    ,{ id: 2, userid: "U0190R4L6JH", message: "please reviewplease reviewplease reviewplease review", completeflg: false }];
let messageUserStore = [{messageId:1, userId:"U0190R4L6JH", checkFlg:false},{messageId:1, userId:"U0190R4L6JH", checkFlg:false}, {messageId:2, userId:"U0190R4L6JH", checkFlg:true}];
let users = [];
exports.getMyReviews = function (userid) {
    return messageStore.filter(message => message.userid === userid);
}

exports.getUsersFromMessageId = (messageId) => {
    return messageUserStore.filter(mu => mu.messageId == messageId);
}

exports.getUsers = () => {return users}
exports.setUsers = (gotMembers) => {
    users = [];
    gotMembers.forEach(element => {
        users.push({id:element.id, name:element.name})
    });
}