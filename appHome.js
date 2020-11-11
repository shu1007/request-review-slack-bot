const store = require("./store");
const constants = require("./constant");
let app;

exports.getAppHomeBlocks = async (userId, appObj) => {
    app = appObj;

    let blocks = [];
    blocks = blocks.concat(await module.exports.createMyTaskBlocks(userId));
    blocks = blocks.concat(await module.exports.createRequestsBlocks(userId));
    return blocks;
};

exports.getDeleteTaskConfirmView = (metaData) => {
    return {
        type: "modal",
        callback_id: "deleteTask",
        private_metadata: metaData,
        title: {
            type: "plain_text",
            text: "確認",
            emoji: true
        },
        submit: {
            type: "plain_text",
            text: "削除する",
            emoji: true
        },
        close: {
            type: "plain_text",
            text: "やめる",
            emoji: true
        },
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*削除* してもよろしいですか？"
                }
            }
        ]
    };
};
module.exports.createMyTaskBlocks = async (
    userId,
    page = 1,
    noHeader = false
) => {
    const storeResult = store.getMyMessage(userId, page);
    messages = storeResult.result;

    let block = [];
    if (!noHeader) {
        block.push({
            type: "header",
            text: {
                type: "plain_text",
                text: "自分のタスク",
                emoji: true
            }
        });
    }

    messages.map((message) => {
        const tmpBlock = [];
        tmpBlock.push({
            type: "divider"
        });
        tmpBlock.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: message.title
            }
        });
        tmpBlock.push(createMessageLinkBlock(message.url));

        const reviewers = store.getUsersFromMessageId(message.id);
        const text = reviewers.map((reviewer) => {
            return `● <@${reviewer.userId}> : ${
                reviewer.status == 1
                    ? ":ok:"
                    : reviewer.status == 0
                    ? ":eyes:"
                    : ":ng:"
            }`;
        });
        tmpBlock.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: text.join("\n")
            }
        });
        tmpBlock.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    action_id: "reRequest",
                    text: {
                        type: "plain_text",
                        text: "再レビュー",
                        emoji: true
                    },
                    value: JSON.stringify({
                        messageId: message.id,
                        isModal: noHeader,
                        page: page,
                        allCount: storeResult.allCount
                    })
                },
                {
                    type: "button",
                    action_id: "deleteTaskConfirm",
                    text: {
                        type: "plain_text",
                        text: "削除",
                        emoji: true
                    },
                    value: JSON.stringify({
                        messageId: message.id,
                        isModal: noHeader,
                        page: page,
                        allCount: storeResult.allCount
                    })
                }
            ]
        });

        block = block.concat(tmpBlock);
    });

    if (!noHeader && constants.COUNT_PER_PAGE < storeResult.allCount) {
        block.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    action_id: "openModalForMyTasks",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: "詳細"
                    },
                    value: Math.ceil(
                        storeResult.allCount / constants.COUNT_PER_PAGE
                    ).toString()
                }
            ]
        });
    }
    return block;
};

exports.createRequestsBlocks = async (userId, page = 1, noHeader = false) => {
    const storeResult = store.getRequests(userId, page);
    const requests = storeResult.result;

    let block = [];
    if (!noHeader) {
        block.push(
            {
                type: "divider"
            },
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "依頼されているもの",
                    emoji: true
                }
            }
        );
    }

    requests.map((message) => {
        const tmpBlock = [];
        tmpBlock.push({
            type: "divider"
        });
        tmpBlock.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: message.title
            }
        });

        tmpBlock.push(createMessageLinkBlock(message.url));
        tmpBlock.push({
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: `依頼者: <@${message.userid}>`
                }
            ]
        });
        tmpBlock.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    action_id: "ok",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: "OK"
                    },
                    style: "primary",
                    value: JSON.stringify({
                        messageId: message.id,
                        isModal: noHeader,
                        page: page,
                        allCount: storeResult.allCount
                    })
                },
                {
                    type: "button",
                    action_id: "ng",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: "NG"
                    },
                    style: "danger",
                    value: JSON.stringify({
                        messageId: message.id,
                        isModal: noHeader,
                        page: page,
                        allCount: storeResult.allCount
                    })
                }
            ]
        });
        block = block.concat(tmpBlock);
    });

    if (!noHeader && constants.COUNT_PER_PAGE < storeResult.allCount) {
        block.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    action_id: "openModalForRequests",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: "詳細"
                    },
                    value: Math.ceil(
                        storeResult.allCount / constants.COUNT_PER_PAGE
                    ).toString()
                }
            ]
        });
    }

    return block;
};

const createMessageLinkBlock = (url) => {
    return {
        type: "context",
        elements: [
            {
                type: "mrkdwn",
                text: `<${url}|メッセージに飛ぶ>`
            }
        ]
    };
};
