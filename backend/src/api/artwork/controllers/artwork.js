'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::artwork.artwork', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    
    const entity = await strapi.entityService.findMany('api::artwork.artwork', {
      ...query,
      populate: {
        artist: true
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::artwork.artwork', id, {
      ...query,
      populate: {
        artist: true
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async featured(ctx) {
    const entities = await strapi.entityService.findMany('api::artwork.artwork', {
      filters: { featured: true },
      populate: {
        artist: true
      }
    });

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async search(ctx) {
    const { query: searchQuery } = ctx.query;
    
    if (!searchQuery) {
      return this.transformResponse([]);
    }

    const entities = await strapi.entityService.findMany('api::artwork.artwork', {
      filters: {
        $or: [
          { title: { $containsi: searchQuery } },
          { description: { $containsi: searchQuery } },
          { artist: { name: { $containsi: searchQuery } } }
        ]
      },
      populate: {
        artist: true
      }
    });

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  }
}));