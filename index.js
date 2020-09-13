const { App } = require('@slack/bolt');
require('dotenv').config();
const store = require('./store');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const createMyReviews = async (userId) => {
  messages = store.getMyReviews(userId);
  let block = [{
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "依頼しているもの",
      "emoji": true
    }
  }];

  let userlist = store.getUsers();
  if (userlist.length === 0) {
    store.setUsers((await app.client.users.list({ token: process.env.SLACK_BOT_TOKEN })).members)
    userlist = store.getUsers();
  }
  console.log(userlist);
  messages.forEach(element => {
    block.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": element.message
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "削除",
          "emoji": true
        },
        "value": "delete"
      }
    })
    const reviewers = store.getUsersFromMessageId(element.id);
    console.log(reviewers)
    block.push(
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": reviewers.map(reviewer => {
            return `- ${userlist.find(user => user.id == reviewer.userId).name} : ${reviewer.checkFlg ? ":ok:" : ":ng:"}`
          }).join('\n')
        }
      });
  });
  return block;
}

let cache = [];
app.action('hoge')
app.command('/rmd', async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  await ack();
  command.user_id
  await say(`${command.text}`);
});
(async () => {
  await app.start(process.env.PORT || 3000);
})();


app.event('app_home_opened', async ({ ack, body, client }) => {
  try {
    console.log(body.event.user)
    client.users.list()
    let userid = body.event.user;
    let blocks = [

    ];
    blocks = blocks.concat(await createMyReviews(userid));
    console.log(blocks);
    client.views.publish({
      user_id: body.event.user,
      view: {
        "type": "home",
        "blocks": blocks
      }
    })
  } catch (e) { console.error(e); }
});