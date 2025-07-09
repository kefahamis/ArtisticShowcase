'use strict';

module.exports = {
  register({ strapi }) {
    // Register any custom functionality here
  },

  async bootstrap({ strapi }) {
    // Import and run bootstrap logic
    const bootstrap = require('./bootstrap');
    await bootstrap();
  },
};