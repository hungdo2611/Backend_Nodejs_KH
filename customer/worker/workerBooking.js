const Queue = require('bee-queue');

const options = {
    isWorker: false,
    sendEvents: false,
    redis: {
        host: process.env.DB_REDIS_HOST,
        port: process.env.DB_REDIS_PORT,
        password: process.env.DB_REDIS_PASS,
        no_ready_check: true,
    },
}

const worker = new Queue('worker_booking', options);


const findingJouneys = (data) => {
    return worker.createJob(data).save();
};

worker.on("succeeded", (job) => {
    // Notify the client via push notification, web socket or email etc.
    console.log(`ready to be served 😋`);
});







module.exports = {
    findingJouneys: findingJouneys,
};