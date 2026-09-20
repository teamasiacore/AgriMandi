import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🌾 AgriMandi API service running on http://localhost:${env.PORT}`);
  console.log(`🛡️  Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Allowed Web Origin: ${env.WEB_URL}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
