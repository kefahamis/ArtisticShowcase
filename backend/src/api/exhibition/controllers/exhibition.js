'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::exhibition.exhibition', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    
    const entity = await strapi.entityService.findMany('api::exhibition.exhibition', {
      ...query
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::exhibition.exhibition', id, {
      ...query
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async current(ctx) {
    const now = new Date();
    
    const entities = await strapi.entityService.findMany('api::exhibition.exhibition', {
      filters: {
        startDate: { $lte: now },
        endDate: { $gte: now }
      },
      sort: { startDate: 'desc' },
      limit: 1
    });

    if (entities.length === 0) {
      return this.transformResponse(null);
    }

    const sanitizedEntity = await this.sanitizeOutput(entities[0], ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));