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
        client.views.publish({
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

const applyReviewAction = async (messageId, userId, status, client) => {
    await store.setStatus(messageId, userId, status);
    await renderAppHomeView(userId, client);
};

app.action("ok", async ({ ack, body, client }) => {
    try {
        await ack();

        const messageId = body.actions[0].value;
        const userId = body.user.id;
        await applyReviewAction(messageId, userId, 1, client);
        const message = store.getMessage(messageId);
        if (
            message != undefined &&
            message.messageTs != null &&
            message.channelId != null
        ) {
            const userName = await Users.getUserName(userId);
            await app.client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN,
                channel: message.channelId,
                text: "text",
                thread_ts: message.messageTs,
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "plain_text",
                            text: `LGTM! from <@${userName}>`,
                            emoji: true
                        }
                    }
                ]
            });
        }
    } catch (error) {
        console.error(error);
    }
});

app.action("ng", async ({ ack, body, client }) => {
    try {
        await ack();

        await applyReviewAction(
            body.actions[0].value,
            body.user.id,
            -1,
            client
        );
    } catch (error) {
        console.error(error);
    }
});

app.action("reRequest", async ({ ack, body, client }) => {
    try {
        await ack();

        await store.resetStatus(body.actions[0].value);
        await renderAppHomeView(body.user.id, client);
    } catch (error) {
        console.error(error);
    }
});

app.command("/req", async ({ ack, body, client }) => {
    try {
        await ack();

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
        const myName = `<@${await Users.getUserName(myUserId)}>`;

        const channelId = view.private_metadata;
        const messageTs = (
            await app.client.chat.postMessage({
                token: context.botToken,
                channel: channelId,
                text: "text",
                blocks: modal.getMessage(
                    title,
                    values.body.body.value,
                    myName,
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
