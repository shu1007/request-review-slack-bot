const { App } = require("@slack/bolt");
require("dotenv").config();
const appHome = require("./appHome");

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
            view: {
                type: "modal",
                callback_id: "deleteTask",
                private_metadata: body.actions[0].value,
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
            }
        });
    } catch (error) {
        console.error(error);
    }
});

app.view("deleteTask", async ({ ack, body, client }) => {
    // モーダルでのデータ送信イベントを確認
    await ack();

    console.log("delete Task No is " + body.view.private_metadata);
});
