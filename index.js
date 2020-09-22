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

app.event("app_home_opened", async ({ ack, body, client }) => {
    try {
        console.log(body.event.user);
        let userid = body.event.user;
        let blocks = await appHome.getAppHomeBlocks(userid, app);
        console.log(blocks);
        client.views.publish({
            user_id: body.event.user,
            view: {
                type: "home",
                blocks: blocks
            }
        });
    } catch (e) {
        console.error(e);
    }
});

app.action("deleteTaskConfirm", async ({ ack, body, client }) => {
    await ack();

    try {
        const result = await client.views.open({
            // 適切な trigger_id を受け取ってから 3 秒以内に渡す
            trigger_id: body.trigger_id,
            // view の値をペイロードに含む
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
    } catch (error) {
        console.error(error);
    }
});

app.action("ok", async ({ ack, body, client }) => {
    try {
        await ack();

        console.log(body.actions);
        store.setStatus(body.actions[0].value, body.user.id, 1);
    } catch (error) {
        console.error(error);
    }
});

app.action("ng", async ({ ack, body, client }) => {
    try {
        await ack();

        console.log(body.actions);
        store.setStatus(body.actions[0].value, body.user.id, -1);
    } catch (error) {
        console.error(error);
    }
});
