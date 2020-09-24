const pg = require("pg");
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

exports.getAllMessages = async () => {
    const result = await pool
        .query("select * from messages;")
        .catch(console.error);
    return result.rows;
};

exports.getAllMessageUsers = async () => {
    const result = await pool
        .query("select * from messageUsers;")
        .catch(console.error);
    return result.rows;
};

exports.insertMessages = async (title, userId, url) => {
    const result = await pool
        .query({
            text:
                "insert into messages (user_id, title, url) values ($1, $2, $3) returning id;",
            values: [userId, title, url]
        })
        .catch(console.error);

    return result.rows[0].id;
};

exports.insertMessageUser = async (messageId, userId) => {
    pool.query({
        text:
            "insert into messageUsers (message_id, user_id, status) values ($1, $2, $3);",
        values: [messageId, userId, 0]
    }).catch((e) => {
        console.log("messageUser error");
        console.error(e);
    });
};

exports.deleteMesseges = async (messageId) => {
    await pool
        .query({
            text: "delete from messages where id = $1;",
            values: [messageId]
        })
        .catch(console.error);

    await pool
        .query({
            text: "delete from messageUsers where message_id = $1;",
            values: [messageId]
        })
        .catch(console.error);
};
