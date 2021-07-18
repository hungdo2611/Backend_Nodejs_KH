const Queue = require('bee-queue');

const options = {
    redis: {
        host: process.env.DB_REDIS_HOST,
        port: process.env.DB_REDIS_PORT,
        password: process.env.DB_REDIS_PASS,
        no_ready_check: true,
    },
}

const worker = new Queue('worker_booking', options);

worker.process(5, (job, done) => {
    console.log("job data", job.data)
    done();

});





