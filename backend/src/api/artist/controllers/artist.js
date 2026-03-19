'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::artist.artist', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    
    const entity = await strapi.entityService.findMany('api::artist.artist', {
      ...query,
      populate: {
        artworks: {
          populate: ['artist']
        }
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::artist.artist', id, {
      ...query,
      populate: {
        artworks: {
          populate: ['artist']
        }
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async featured(ctx) {
    const entities = await strapi.entityService.findMany('api::artist.artist', {
      filters: { featured: true },
      populate: {
        artworks: {
          populate: ['artist']
        }
      }
    });

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  }
}));