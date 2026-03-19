'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::artwork.artwork');

const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/artworks/featured',
      handler: 'artwork.featured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search',
      handler: 'artwork.search',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

defaultRouter.routes.push(...customRoutes.routes);

module.exports = defaultRouter;