import express from 'express';

import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from '../../controllers/operations/task.controller.js';
import { validate } from '../../middlewares/zod.middleware.js';
import {
  createTaskSchema,
  deleteTaskSchema,
  getAllTasksSchema,
  getTaskByIdSchema,
  updateTaskSchema,
} from '../../validators/operations/task.validator.js';

const router = express.Router();

router.post('/', protect, validate(createTaskSchema), createTask);
router.get('/', protect, validate(getAllTasksSchema), getAllTasks);
router.get('/:id', protect, validate(getTaskByIdSchema), getTaskById);
router.put('/:id', protect, isAdmin, validate(updateTaskSchema), updateTask);
router.delete('/:id', protect, isAdmin, validate(deleteTaskSchema), deleteTask);

export default router;
