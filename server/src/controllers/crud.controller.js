// src/controllers/crud.controller.js

import { crudService } from '../services/crud.service.js';
import catchAsync from '../utils/catch.async.js';
import successResponse from '../utils/success.response.js';

export const getAllController = (model, name, searchFields = []) =>
  catchAsync(async (req, res) => {
    const search = req.query.search || '';
    const data = await crudService.getAll(model, search, searchFields);

    successResponse({
      res,
      code: 200,
      succeeded: true,
      message:
        data.length === 0
          ? `No ${name.toLowerCase()} found`
          : `${name} fetched successfully!`,
      data,
    });
  });

export const getOneController = (model, name) =>
  catchAsync(async (req, res) => {
    const data = await crudService.getOne(model, req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ succeeded: false, message: `${name} not found` });

    successResponse({
      res,
      code: 200,
      succeeded: true,
      message: `${name} fetched successfully!`,
      data,
    });
  });

export const createController = (model, name) =>
  catchAsync(async (req, res) => {
    const data = await crudService.create(model, req.body);
    successResponse({
      res,
      code: 201,
      succeeded: true,
      message: `${name} created successfully!`,
      data,
    });
  });

export const updateController = (model, name) =>
  catchAsync(async (req, res) => {
    const data = await crudService.update(model, req.params.id, req.body);
    successResponse({
      res,
      code: 200,
      succeeded: true,
      message: `${name} updated successfully!`,
      data,
    });
  });

export const deleteController = (model, name) =>
  catchAsync(async (req, res) => {
    await crudService.remove(model, req.params.id);
    successResponse({
      res,
      code: 200,
      succeeded: true,
      message: `${name} deleted successfully!`,
    });
  });
