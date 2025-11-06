#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function startRedis() {
    if (process.env.REDIS_URL) {
        console.log('✅ REDIS_URL is set, using external Redis at:', process.env.REDIS_URL);
        console.log('   No need to start redis-memory-server');
        process.exit(0);
    }

    if (process.env.REDIS_LOCAL !== 'true') {
        console.log('❌ REDIS_LOCAL is not set to "true"');
        console.log('   Set REDIS_LOCAL=true in .env to use redis-memory-server');
        console.log('   Or set REDIS_URL for external Redis');
        process.exit(1);
    }

    console.log('🚀 Starting Redis memory server...');

    try {
        const { RedisMemoryServer } = await import('redis-memory-server');

        const redisServer = new RedisMemoryServer({
            instance: {
                port: 6379, // Use standard Redis port for consistency
            },
        });

        const host = await redisServer.getHost();
        const port = await redisServer.getPort();
        const uri = `redis://${host}:${port}`;

        console.log('✅ Redis memory server started successfully');
        console.log(`   URL: ${uri}`);
        console.log('   Use Ctrl+C to stop');

        // Keep the process running
        process.on('SIGINT', async () => {
            console.log('\n🛑 Stopping Redis memory server...');
            await redisServer.stop();
            console.log('✅ Redis memory server stopped');
            process.exit(0);
        });

        // Keep alive
        setInterval(() => { }, 1000);

    } catch (error) {
        console.error('❌ Failed to start Redis memory server:', error.message);
        console.error('   Alternative: Set REDIS_URL to use external Redis (e.g., REDIS_URL=redis://localhost:6379)');
        process.exit(1);
    }
}

startRedis();
