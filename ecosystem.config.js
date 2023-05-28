/**
 * PM2 application configuration
 * http://pm2.keymetrics.io/docs/usage/application-declaration/
 */
module.exports = {
  apps: [
    {
      script: 'npm',
      args: ['run', 'start:api'],
      name: `api-app-${process.env.NODE_ENV}`,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true
    }
  ]
};
