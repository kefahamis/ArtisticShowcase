'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::artist.artist');

const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/artists/featured',
      handler: 'artist.featured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

defaultRouter.routes.push(...customRoutes.routes);

module.exports = defaultRouter;