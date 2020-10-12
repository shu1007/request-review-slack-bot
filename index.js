const { App } = require("@slack/bolt");
require("dotenv").config();
const appHome = require("./appHome");
const modal = require("./modal");
const store = require("./store");
const Users = require("./user");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log("Start app.");
})();

const renderAppHomeView = async (userId, client) => {
    try {
        const blocks = await appHome.getAppHomeBlocks(userId, app);
        await client.views.publish({
            user_id: userId,
            view: {
                type: "home",
                blocks: blocks
            }
        });
    } catch (e) {
        console.error(e);
    }
};

app.event("app_home_opened", async ({ body, client }) => {
    console.log("appHome");
    await renderAppHomeView(body.event.user, client);
});

app.action("deleteTaskConfirm", async ({ ack, body, client }) => {
    await ack();

    try {
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: appHome.getDeleteTaskConfirmView(body.actions[0].value)
        });
    } catch (error) {
        console.error(error);
    }
});

app.view("deleteTask", async ({ ack, body, client }) => {
    try {
        await ack();

        await store.deleteMessage(body.view.private_metadata);
        await renderAppHomeView(body.user.id, client);
    } catch (error) {
        console.error(error);
    }
});

const applyReviewAction = async (messageId, userId, status, client, blocks) => {
    await store.setStatus(messageId, userId, status);
    await renderAppHomeView(userId, client);

    setTimeout(() => {}, 300);
    const message = store.getMessage(messageId);
    if (
        message != undefined &&
        message.messageTs != null &&
        message.channelId != null
    ) {
        await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: message.channelId,
            text: "text",
            thread_ts: message.messageTs,
            blocks: blocks
        });

        blocks.push({
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: `<${message.url}|${message.title}>`
                }
            ]
        });
        await app.client.chat
            .postMessage({
                token: process.env.SLACK_BOT_TOKEN,
                channel: message.userid,
                text: "text",
                thread_ts: message.messageTs,
                blocks: blocks
            })
            .catch(console.error);
    }
};

const lockKeySet = new Set();
app.action("ok", ({ ack, body, client }) => {
    ack();

    const messageId = body.actions[0].value;
    const userId = body.user.id;

    const lockKey = `${messageId}:${userId}`;
    if (lockKeySet.has(lockKey)) {
        return;
    } else {
        lockKeySet.add(lockKey);
    }

    (async () => {
        try {
            const userName = await Users.getUserName(userId);
            await applyReviewAction(messageId, userId, 1, client, [
                {
                    type: "section",
                    text: {
                        type: "plain_text",
                        text: `LGTM! from <@${userName}>`,
                        emoji: true
                    }
                }
            ]);
            lockKeySet.delete(lockKey);
        } catch (error) {
            console.error(error);
        }
    })();
});

app.action("ng", ({ ack, body, client }) => {
    ack();

    const messageId = body.actions[0].value;
    const userId = body.user.id;

    const lockKey = `${messageId}:${userId}`;
    if (lockKeySet.has(lockKey)) {
        return;
    } else {
        lockKeySet.add(lockKey);
    }

    (async () => {
        try {
            const userName = await Users.getUserName(userId);
            await applyReviewAction(messageId, userId, -1, client, [
                {
                    type: "section",
                    text: {
                        type: "plain_text",
                        text: `:woman-gesturing-no: from <@${userName}>`,
                        emoji: true
                    }
                }
            ]);
            lockKeySet.delete(lockKey);
        } catch (error) {
            console.error(error);
        }
    })();
});

app.action("reRequest", async ({ ack, body, client }) => {
    try {
        await ack();
        const messageId = body.actions[0].value;
        const userIds = await store.resetStatus(messageId);
        const message = store.getMessage(messageId);

        userIds.forEach(async (userId) => {
            const userName = await Users.getUserName(userId);

            app.client.chat
                .postMessage({
                    token: process.env.SLACK_BOT_TOKEN,
                    channel: userId,
                    text: "text",
                    thread_ts: message.messageTs,
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "plain_text",
                                text: `再レビュー依頼 from <@${userName}>`,
                                emoji: true
                            }
                        },
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "mrkdwn",
                                    text: `<${message.url}|${message.title}>`
                                }
                            ]
                        }
                    ]
                })
                .catch(console.error);
        });
        await renderAppHomeView(body.user.id, client);
    } catch (error) {
        console.error(error);
    }
});

app.command("/req", async ({ ack, body, client }) => {
    try {
        const channelId = body.channel_id;
        if (!channelId.startsWith("C")) {
            // 何がしかのバリデーション
            ack({
                response_action: "errors",
                text: "ここには投稿出来ません。"
            });
            return;
        } else {
            ack();
        }

        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: modal.getCommandModalBlocks(body.channel_id)
        });
    } catch (e) {
        console.error(e);
    }
});

app.view("submitRequest", async ({ ack, body, view, client, context }) => {
    try {
        await ack();

        const values = view.state.values;
        const title = values.title.title.value;
        const userIds = values.users.users.selected_users;

        const myUserId = body.user.id;

        const channelId = view.private_metadata;
        const messageTs = (
            await app.client.chat.postMessage({
                token: context.botToken,
                channel: channelId,
                text: "text",
                blocks: modal.getMessage(
                    title,
                    values.body.body.value,
                    `<@${myUserId}>`,
                    userIds
                        .map((uid) => {
                            return `<@${uid}>`;
                        })
                        .join(" ")
                )
            })
        ).message.ts;

        const messageUrl = (
            await app.client.chat.getPermalink({
                token: context.botToken,
                channel: channelId,
                message_ts: messageTs
            })
        ).permalink;

        const messageId = await store.setMessage(
            title,
            myUserId,
            messageUrl,
            channelId,
            messageTs
        );
        store.setMessageUsers(messageId, userIds);
    } catch (e) {
        console.error(e);
    }
});
