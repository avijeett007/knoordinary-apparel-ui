module.exports = {
  apps: [
    {
      name: 'kno2gether-shopper',
      script: 'server.js',
      env: {
        NODE_ENV: 'development',
      },
      watch: true,
      ignore_watch: ['node_modules', '.next', '.git'],
    },
  ],
};
