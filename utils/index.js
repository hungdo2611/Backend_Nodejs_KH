var admin = require("firebase-admin");

async function pushNotificationTo_User(lst, title, body, data) {
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

async function pushNotificationToTopic(topic, title, body, data) {
    const payload = {
        notification: {
            title: title,
            body: body,
            sound: 'defaulf'
        },
        data: data,

    };

    const send = await admin.messaging().sendToTopic(topic, payload);
    console.log("send status", send)

}
module.exports = { pushNotificationTo_User, pushNotificationToTopic }