const strapi = require('@strapi/strapi');

const app = strapi({
  dir: __dirname,
  autoReload: { enabled: false },
  logger: {
    level: 'info',
    requests: true
  }
});

app.start().then(() => {
  console.log('Strapi CMS is running on http://localhost:1337');
  console.log('Admin panel: http://localhost:1337/admin');
}).catch(err => {
  console.error('Failed to start Strapi:', err);
  process.exit(1);
});