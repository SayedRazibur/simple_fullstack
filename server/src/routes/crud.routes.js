// src/routes/crud.routes.js
import { Router } from 'express';
import {
  createController,
  deleteController,
  getAllController,
  getOneController,
  updateController,
} from '../controllers/crud.controller.js';
import { isAdmin, protect } from '../middlewares/auth.middleware.js';

/**
 * Builds a CRUD router for any Prisma model.
 * @param {string} model - Prisma model name (camelCase)
 * @param {string} name  - Friendly name for messages
 * @param {string} searchFields  - Searchable fields
 */

export const buildCrudRouter = (model, name, searchFields = []) => {
  const router = Router();

  router
    .route('/')
    .get(protect, getAllController(model, name, searchFields))
    .post(protect, createController(model, name));

  router
    .route('/:id')
    .get(protect, getOneController(model, name))
    .patch(protect, isAdmin, updateController(model, name))
    .delete(protect, isAdmin, deleteController(model, name));

  return router;
};
