// src/services/crud.service.js

import prisma from '../config/prisma.js';

/**
 * Generic Prisma CRUD functions.
 * ModelName = the Prisma model name as a string (e.g. "recurrence", "unit", "orderType")
 */

export const crudService = {
  getAll: async (model, search, searchFields = []) => {
    const where = {};

    if (search && searchFields.length > 0) {
      where.OR = searchFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    return prisma[model].findMany({ where });
  },

  getOne: async (model, id) => {
    return prisma[model].findUnique({
      where: { id: Number(id) },
    });
  },

  create: async (model, data) => {
    return prisma[model].create({ data });
  },

  update: async (model, id, data) => {
    return prisma[model].update({
      where: { id: Number(id) },
      data,
    });
  },

  remove: async (model, id) => {
    return prisma[model].delete({
      where: { id: Number(id) },
    });
  },
};
