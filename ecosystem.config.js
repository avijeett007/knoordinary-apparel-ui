module.exports = {
  apps: [{
    name: 'kno2gether-shopper',
    script: 'npm',
    args: 'run dev',
    watch: false,
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
}
