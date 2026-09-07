import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createItinerarySchema,
  createTripDaySchema,
  createTripSchema,
  itineraryParamsSchema,
  reorderItinerariesSchema,
  shareTokenParamsSchema,
  tripDayParamsSchema,
  tripIdParamsSchema,
  tripListQuerySchema,
  updateItinerarySchema,
  updateTripDaySchema,
  updateTripSchema,
} from '../validators/trip.validator';

const router = Router();

// Public: token is the only credential required to view a shared trip.
router.get(
  '/shared/:shareToken',
  validate(shareTokenParamsSchema, 'params'),
  tripController.getSharedTrip
);

router.use(authenticate);

router.get('/', validate(tripListQuerySchema, 'query'), tripController.getTrips);
router.post('/', validate(createTripSchema), tripController.createTrip);

router.get(
  '/:tripId/cost-summary',
  validate(tripIdParamsSchema, 'params'),
  tripController.getCostSummary
);
router.post(
  '/:tripId/share',
  validate(tripIdParamsSchema, 'params'),
  tripController.enableTripShare
);
router.delete(
  '/:tripId/share',
  validate(tripIdParamsSchema, 'params'),
  tripController.disableTripShare
);

router.get(
  '/:tripId/days',
  validate(tripIdParamsSchema, 'params'),
  tripController.getTripDays
);
router.post(
  '/:tripId/days',
  validate(tripIdParamsSchema, 'params'),
  validate(createTripDaySchema),
  tripController.createTripDay
);

router.get(
  '/:tripId/days/:dayId/itineraries',
  validate(tripDayParamsSchema, 'params'),
  tripController.getItineraries
);
router.post(
  '/:tripId/days/:dayId/itineraries',
  validate(tripDayParamsSchema, 'params'),
  validate(createItinerarySchema),
  tripController.createItinerary
);
router.put(
  '/:tripId/days/:dayId/itineraries/order',
  validate(tripDayParamsSchema, 'params'),
  validate(reorderItinerariesSchema),
  tripController.reorderItineraries
);
router.get(
  '/:tripId/days/:dayId/itineraries/:itineraryId',
  validate(itineraryParamsSchema, 'params'),
  tripController.getItinerary
);
router.patch(
  '/:tripId/days/:dayId/itineraries/:itineraryId',
  validate(itineraryParamsSchema, 'params'),
  validate(updateItinerarySchema),
  tripController.updateItinerary
);
router.delete(
  '/:tripId/days/:dayId/itineraries/:itineraryId',
  validate(itineraryParamsSchema, 'params'),
  tripController.deleteItinerary
);

router.get(
  '/:tripId/days/:dayId',
  validate(tripDayParamsSchema, 'params'),
  tripController.getTripDay
);
router.patch(
  '/:tripId/days/:dayId',
  validate(tripDayParamsSchema, 'params'),
  validate(updateTripDaySchema),
  tripController.updateTripDay
);
router.delete(
  '/:tripId/days/:dayId',
  validate(tripDayParamsSchema, 'params'),
  tripController.deleteTripDay
);

router.get('/:tripId', validate(tripIdParamsSchema, 'params'), tripController.getTrip);
router.patch(
  '/:tripId',
  validate(tripIdParamsSchema, 'params'),
  validate(updateTripSchema),
  tripController.updateTrip
);
router.delete('/:tripId', validate(tripIdParamsSchema, 'params'), tripController.deleteTrip);

export default router;
