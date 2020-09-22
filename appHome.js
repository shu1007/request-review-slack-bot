const store = require("./store");
let userlist = store.getUsers();
let app;

exports.getAppHomeBlocks = async (userId, appObj) => {
    app = appObj;

    let blocks = [];
    blocks = blocks.concat(await createMyTaskBlocks(userId));
    blocks = blocks.concat(await CreateRequestsBlocks(userId));
    return blocks;
};

const createMyTaskBlocks = async (userId) => {
    messages = store.getMyTask(userId);

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

    if (userlist.length === 0) {
        store.setUsers(
            (
                await app.client.users.list({
                    token: process.env.SLACK_BOT_TOKEN
                })
            ).members
        );
        userlist = store.getUsers();
    }
    console.log(userlist);
    messages.forEach((message) => {
        block.push({
            type: "divider"
        });
        block.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: message.message
            }
        });
        block.push(createMessageLinkBlock(message.url));

        const reviewers = store.getUsersFromMessageId(message.id);
        block.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: reviewers
                    .map((reviewer) => {
                        return `● <@${
                            userlist.find((user) => user.id == reviewer.userId)
                                .name
                        }> : ${reviewer.checkFlg ? ":ok:" : ":ng:"}`;
                    })
                    .join("\n")
            }
        });
        block.push({
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
    });
    return block;
};

const CreateRequestsBlocks = async (userId) => {
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
    if (userlist.length === 0) {
        store.setUsers(
            (
                await app.client.users.list({
                    token: process.env.SLACK_BOT_TOKEN
                })
            ).members
        );
        userlist = store.getUsers();
    }
    requests.forEach((message) => {
        block.push({
            type: "divider"
        });
        block.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: message.message
            },
            accessory: {
                type: "static_select",
                placeholder: {
                    type: "plain_text",
                    text: "Select an item",
                    emoji: true
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "OK :OK:",
                            emoji: true
                        },
                        value: "value-0"
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "NG :NG:",
                            emoji: true
                        },
                        value: "value-1"
                    }
                ]
            }
        });
        block.push(createMessageLinkBlock(message.url));
        block.push({
            type: "context",
            elements: [
                {
                    type: "plain_text",
                    text: `依頼者: <@${
                        userlist.find((user) => user.id === message.userid).name
                    }>`,
                    emoji: true
                }
            ]
        });
    });
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
