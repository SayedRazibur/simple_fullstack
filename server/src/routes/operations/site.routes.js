import express from 'express';


import {
  createSite,
  updateSite,
  deleteSite,
  getAllSites,
  getSiteById,
} from '../../controllers/operations/site.controller.js';
import {
  createSiteSchema,
  updateSiteSchema,
  deleteSiteSchema,
  getAllSitesSchema,
  getSiteByIdSchema,
} from '../../validators/operations/site.validator.js';
import { validate } from '../../middlewares/zod.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, validate(createSiteSchema), createSite);

router.put('/:id', protect, validate(updateSiteSchema), updateSite);

router.delete('/:id', protect, validate(deleteSiteSchema), deleteSite);

router.get('/', protect, validate(getAllSitesSchema), getAllSites);

router.get('/:id', protect, validate(getSiteByIdSchema), getSiteById);

export default router;
