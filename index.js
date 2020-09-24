const { App } = require("@slack/bolt");
require("dotenv").config();
const appHome = require("./appHome");
const modal = require("./modal");
const store = require("./store");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
    await app.start(process.env.PORT || 3000);
})();

const renderAppHomeView = async (userId, client) => {
    try {
        const blocks = await appHome.getAppHomeBlocks(userId, app);
        console.log(blocks);
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
    renderAppHomeView(body.event.user, client);
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

        store.deleteMessage(body.view.private_metadata);
        console.log("delete Task No is " + body.view.private_metadata);
        renderAppHomeView(body.user.id, client);
    } catch (error) {
        console.error(error);
    }
});

const applyReviewAction = async (messageId, userId, status, client) => {
    store.setStatus(messageId, userId, status);
    renderAppHomeView(userId, client);
};

app.action("ok", async ({ ack, body, client }) => {
    try {
        console.log("ok");
        await ack();

        applyReviewAction(body.actions[0].value, body.user.id, 1, client);
    } catch (error) {
        console.error(error);
    }
});

app.action("ng", async ({ ack, body, client }) => {
    try {
        await ack();

        applyReviewAction(body.actions[0].value, body.user.id, -1, client);
    } catch (error) {
        console.error(error);
    }
});

app.action("reRequest", async ({ ack, body, client }) => {
    try {
        await ack();

        store.resetStatus(body.actions[0].value);
        renderAppHomeView(body.user.id, client);
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
        console.log(view.private_metadata);
        let userList = store.getUsers();
        if (userList.length === 0) {
            store.setUsers(
                (
                    await app.client.users.list({
                        token: process.env.SLACK_BOT_TOKEN
                    })
                ).members
            );
            userList = store.getUsers();
        }

        const values = view.state.values;
        const title = values.title.title.value;
        const userIds = values.users.users.selected_users;

        const userNames = userIds
            .map((uid) => {
                return `<@${userList.find((u) => u.id == uid).name}>`;
            })
            .join(" ");
        const myUserId = body.user.id;
        const myName = `<@${userList.find((u) => u.id == myUserId).name}>`;

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
                    userNames
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

        console.log(messageUrl);
        const messageId = await store.setMessage(title, myUserId, messageUrl);
        store.setMessageUsers(messageId, userIds);
    } catch (e) {
        console.error(e);
    }
});
