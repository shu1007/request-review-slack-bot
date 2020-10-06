const store = require("./store");
let app;

exports.getAppHomeBlocks = async (userId, appObj) => {
    app = appObj;

    let blocks = [];
    blocks = blocks.concat(await createMyTaskBlocks(userId));
    blocks = blocks.concat(await createRequestsBlocks(userId));
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
const createMyTaskBlocks = async (userId) => {
    messages = store.getMyMessage(userId);

    let block = [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: "自分のタスク",
                emoji: true
            }
        }
    ];

    await Promise.all(
        messages.map(async (message) => {
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
            const text = await Promise.all(
                reviewers.map(async (reviewer) => {
                    return `● <@${reviewer.userId}> : ${
                        reviewer.status == 1
                            ? ":ok:"
                            : reviewer.status == 0
                            ? ":eyes:"
                            : ":ng:"
                    }`;
                })
            );
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
                        value: `${message.id}`
                    },
                    {
                        type: "button",
                        action_id: "deleteTaskConfirm",
                        text: {
                            type: "plain_text",
                            text: "削除",
                            emoji: true
                        },
                        value: `${message.id}`
                    }
                ]
            });

            block = block.concat(tmpBlock);
        })
    );

    return block;
};

const createRequestsBlocks = async (userId) => {
    const requests = store.getRequests(userId);

    let block = [
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
    ];
    await Promise.all(
        requests.map(async (message) => {
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
                        value: `${message.id}`
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
                        value: `${message.id}`
                    }
                ]
            });
            block = block.concat(tmpBlock);
        })
    );
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
