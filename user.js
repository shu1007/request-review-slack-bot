const NodeCache = require("node-cache");

const { WebClient } = require("@slack/web-api");
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

class Users {
    cache = new NodeCache({ stdTTL: 600, checkperiod: 1200 });

    async getUserName(userId) {
        let userName = this.cache.get(userId);
        if (userName === undefined) {
            const response = await client.users
                .info({ user: userId })
                .catch(console.error);
            userName = response.user.name;
            this.cache.set(userId, userName);
        }

        return userName;
    }
}

module.exports = new Users();
