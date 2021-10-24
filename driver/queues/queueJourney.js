const Queue = require('bee-queue');

const options = {
    removeOnSuccess: true,
    redis: {
        host: process.env.DB_REDIS_HOST,
        port: process.env.DB_REDIS_PORT,
        password: process.env.DB_REDIS_PASS,
        no_ready_check: true,
    },
}
const queue = new Queue('worker_journey', options);

const acceptBooking = (x, y) => {


    return queue.createJob({ x: x, y: y }).save();
};
queue.on('ready', function () {
    queue.process(function (job, done) {
        console.log('processing job ' + job.id);
        console.log("data job", job.data)
        setTimeout(function () {
            done(null, job.data.x + job.data.y);
        }, 10);
    });

    console.log('processing jobs...');
});

queue.on("succeeded", (job, result) => {
    console.log(`job succeed`, job.data, result);

});


module.exports = {
    acceptBooking: acceptBooking,
};