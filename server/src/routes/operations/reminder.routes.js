import express from 'express';

import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import {
  createReminder,
  deleteReminder,
  getAllReminders,
  getReminderById,
  updateReminder,
} from '../../controllers/operations/reminder.controller.js';
import { validate } from '../../middlewares/zod.middleware.js';
import {
  createReminderSchema,
  deleteReminderSchema,
  getAllRemindersSchema,
  getReminderByIdSchema,
  updateReminderSchema,
} from '../../validators/operations/reminder.validator.js';

const router = express.Router();

router.post('/', protect, validate(createReminderSchema), createReminder);
router.get('/', protect, validate(getAllRemindersSchema), getAllReminders);
router.get('/:id', protect, validate(getReminderByIdSchema), getReminderById);
router.put(
  '/:id',
  protect,
  isAdmin,
  validate(updateReminderSchema),
  updateReminder
);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deleteReminderSchema),
  deleteReminder
);

export default router;
