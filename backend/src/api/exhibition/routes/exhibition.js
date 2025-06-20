'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::exhibition.exhibition');

const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/exhibitions/current',
      handler: 'exhibition.current',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

defaultRouter.routes.push(...customRoutes.routes);

module.exports = defaultRouter;