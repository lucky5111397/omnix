import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});
export default redisClient;