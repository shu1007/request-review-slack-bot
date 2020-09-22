const { App } = require("@slack/bolt");
require("dotenv").config();
const appHome = require("./appHome");
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
        let blocks = await appHome.getAppHomeBlocks(userId, app);
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
