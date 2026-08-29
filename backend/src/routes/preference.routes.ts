import { Router } from 'express';
import * as preferenceController from '../controllers/preference.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createPreferenceSchema,
  updatePreferenceSchema,
} from '../validators/preference.validator';

const router = Router();

router.use(authenticate);

router.get('/', preferenceController.getPreference);
router.post('/', validate(createPreferenceSchema), preferenceController.createPreference);
router.patch('/', validate(updatePreferenceSchema), preferenceController.updatePreference);
router.put('/', validate(updatePreferenceSchema), preferenceController.updatePreference);
router.delete('/', preferenceController.deletePreference);

export default router;
