exports.getCommandModalBlocks = (metaData) => {
    return {
        type: "modal",
        private_metadata: metaData,
        callback_id: "submitRequest",
        submit: {
            type: "plain_text",
            text: "送る",
            emoji: true
        },
        close: {
            type: "plain_text",
            text: "やめる",
            emoji: true
        },
        title: {
            type: "plain_text",
            text: "レビュー依頼作成",
            emoji: true
        },
        blocks: [
            {
                type: "input",
                block_id: "title",
                element: {
                    type: "plain_text_input",
                    action_id: "title"
                },
                label: {
                    type: "plain_text",
                    text: "タイトル",
                    emoji: true
                }
            },
            {
                type: "input",
                block_id: "body",
                element: {
                    type: "plain_text_input",
                    action_id: "body",
                    multiline: true
                },
                label: {
                    type: "plain_text",
                    text: "本文",
                    emoji: true
                }
            },
            {
                type: "input",
                block_id: "users",
                element: {
                    type: "multi_users_select",
                    action_id: "users",
                    placeholder: {
                        type: "plain_text",
                        text: "Select users",
                        emoji: true
                    }
                },
                label: {
                    type: "plain_text",
                    text: "レビュアー選択",
                    emoji: true
                }
            }
        ]
    };
};

exports.getMessage = (title, body, fromUserStr, toUsersStr) => {
    return [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: "レビュー依頼",
                emoji: true
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `From : ${fromUserStr}`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `To : ${toUsersStr}`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: title
            }
        },
        {
            type: "divider"
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: body
            }
        }
    ];
};

exports.getPagingModal = (title, contents, actionId, page, totalPage) => {
    let elements = [];
    const pageObject = { totalPage: totalPage };
    if (totalPage > 0) {
        if (page > 1) {
            pageObject.page = page - 1;
            elements.push({
                type: "button",
                action_id: `${actionId}_1`,
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: ":arrow_left:"
                },
                value: JSON.stringify(pageObject)
            });
        }
        if (page != totalPage) {
            pageObject.page = page + 1;
            elements.push({
                type: "button",
                action_id: `${actionId}_2`,
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: ":arrow_right:"
                },
                value: JSON.stringify(pageObject)
            });
        }
        if (elements.length > 0) {
            contents.push({
                type: "actions",
                elements: elements
            });
        }
    }

    return {
        type: "modal",
        title: {
            type: "plain_text",
            text: title,
            emoji: true
        },
        blocks: contents
    };
};

exports.createActionValueObject = (page, allCount, viewId, viewHash) => {
    return {
        page: page,
        allCount: allCount,
        viewId: viewId,
        viewHash: viewHash
    };
};
