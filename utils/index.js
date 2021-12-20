var admin = require("firebase-admin");
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient({
    host: '127.0.0.1',
    no_ready_check: true,
    auth_pass: process.env.DB_REDIS_PASS,
});

client.on('error', (err) => {
    console.log("Error redis" + err)
});
client.on('connect', () => {
    console.log("connected to redis");
});

async function pushNotificationTo_User(lst, title, body, data) {
    console.log('data send', data);
    if (lst && Array.isArray(lst)) {
        const send = await admin.messaging().sendMulticast({
            tokens: lst,
            data: data,
            notification: {
                title: title,
                body: body,

            },
        });
        console.log("send status", send)
    }

}

async function pushNotificationToTopic(topic, title, body, data) {
    const payload = {
        notification: {
            title: title,
            body: body,
            sound: 'defaulf'
        },
        data: data,

    };

    const send = await admin.messaging().sendToTopic(
        topic,
        payload, {
        contentAvailable: true,
        priority: 'high',
    });
    console.log("send status", send)

}

async function setRedisData(key, data) {
    const dataString = JSON.stringify(data);
    await client.set(key, dataString);
}
async function getRedisData(key) {
    let data = await client.get(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}
async function deleteRedisData(key) {
    await client.del(key);
}
module.exports = { pushNotificationTo_User, pushNotificationToTopic, setRedisData, getRedisData, deleteRedisData }