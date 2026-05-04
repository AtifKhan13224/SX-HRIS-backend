/**
 * PM2 Ecosystem Configuration for SX-HRIS Backend
 * 
 * This configuration file manages the Node.js application lifecycle
 * on production servers using PM2 process manager.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 restart ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 logs sx-hris-backend
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'sx-hris-backend',
      script: './dist/main.js',
      instances: 'max', // Use all available CPU cores (cluster mode)
      exec_mode: 'cluster',
      
      // Environment Variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Process Management
      autorestart: true,
      watch: false, // Don't watch in production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true, // Prefix logs with timestamp
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced Options
      listen_timeout: 10000, // Time to wait for app to listen
      kill_timeout: 5000, // Time to wait before force killing
      wait_ready: true, // Wait for 'ready' event before considering app started
      
      // Monitoring
      min_uptime: '10s', // Min uptime before considering unstable
      max_restarts: 10, // Max restarts within 1 minute before stopping
      
      // Graceful Shutdown
      kill_timeout: 5000,
      shutdown_with_message: true,
      
      // Source Map Support
      source_map_support: true,
      
      // Cron Restart (optional - restart daily at 4 AM)
      // cron_restart: '0 4 * * *',
      
      // Auto-restart if app crashes
      autorestart: true,
      
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      
      // Interpreter (Node.js)
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=2048',
    },
  ],

  /**
   * Deployment Configuration for PM2 Deploy
   * 
   * Usage:
   *   pm2 deploy ecosystem.config.js production setup
   *   pm2 deploy ecosystem.config.js production
   *   pm2 deploy ecosystem.config.js production revert 1
   */
  deploy: {
    production: {
      // Server Configuration
      user: 'ec2-user', // EC2 user
      host: ['16.16.254.121'], // EC2 Public IP
      ref: 'origin/main', // Git branch to deploy
      repo: 'git@github.com:your-username/sx-hris.git', // Replace with your actual repo URL
      path: '/home/ec2-user/sx-hris-backend',
      ssh_options: 'StrictHostKeyChecking=no',
      
      // Pre-deploy: Git pull
      'pre-deploy-local': 'echo "Starting deployment to production..."',
      
      // Deploy Commands
      'post-deploy': 
        'npm install && ' +
        'npm run build && ' +
        'pm2 reload ecosystem.config.js --env production && ' +
        'pm2 save',
      
      // Pre-setup: Install dependencies on server
      'pre-setup': 
        'sudo apt-get update && ' +
        'sudo apt-get install -y git curl',
      
      // Environment
      env: {
        NODE_ENV: 'production',
      },
    },
    
    staging: {
      user: 'ec2-user',
      host: ['your-staging-instance.compute.amazonaws.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/sx-hris.git',
      path: '/home/ec2-user/sx-hris-backend-staging',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy': 
        'npm install && ' +
        'npm run build && ' +
        'pm2 reload ecosystem.config.js --env staging && ' +
        'pm2 save',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
    },
  },
};
