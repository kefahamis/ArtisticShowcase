const strapi = require('@strapi/strapi');

async function main() {
  try {
    console.log('Starting Strapi CMS on port 1337...');
    
    const app = strapi({
      dir: __dirname,
      autoReload: { enabled: false },
      logger: {
        level: 'info'
      }
    });

    await app.start();
    console.log('✅ Strapi CMS ready at http://localhost:1337/admin');
    
  } catch (error) {
    console.error('Failed to start Strapi:', error);
    process.exit(1);
  }
}

main();