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

exports.insertMessages = async (title, userId, url, channelId, messageTs) => {
    const result = await executeWithTransaction(
        "insert into messages (user_id, title, url, channel_id, message_ts) values ($1, $2, $3, $4, $5) returning id;",
        [userId, title, url, channelId, messageTs]
    );

    return result.rows[0].id;
};

exports.insertMessageUser = async (messageId, userId) => {
    await executeWithTransaction(
        "insert into messageUsers (message_id, user_id, status) values ($1, $2, $3);",
        [messageId, userId, 0]
    );
};

exports.setStatus = async (messageId, userId, status) => {
    await executeWithTransaction(
        "update messageUsers set status = $1 where message_id = $2 and user_id = $3",
        [status, messageId, userId]
    );
};
exports.resetStatus = async (messageId) => {
    await executeWithTransaction(
        "update messageUsers set status = $1 where message_id = $2 and status = $3;",
        [0, messageId, -1]
    );
};

exports.deleteMesseges = async (messageId) => {
    await executeWithTransaction("delete from messages where id = $1;", [
        messageId
    ]);
    await executeWithTransaction(
        "delete from messageUsers where message_id = $1;",
        [messageId]
    );
};

executeWithTransaction = async (sql, params) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(sql, params);
        await client.query("COMMIT");
        return result;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};
