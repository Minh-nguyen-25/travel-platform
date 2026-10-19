import { Router } from 'express';
import expenseRoutes from './expense.routes';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { tripService } from '../services/trip.service';
import { mapService } from '../services/map.service';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response.utils';
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
router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

// Shared viewers can route only the saved stops of a currently public trip.
router.post('/shared/:shareToken/days/:dayNumber/route',
  rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }),
  validate(z.object({ shareToken: z.string().regex(/^[a-f0-9]{64}$/), dayNumber: z.coerce.number().int().positive() }), 'params'),
  async (req, res) => {
    const trip = await tripService.getSharedTrip(String(req.params.shareToken));
    const day = trip.tripDays.find((item) => item.dayNumber === Number(req.params.dayNumber));
    if (!day) throw new AppError('Không tìm thấy ngày trong chuyến đi', 404);
    if (day.itineraries.length < 2) throw new AppError('Cần ít nhất hai điểm dừng', 422);
    const mode = day.itineraries[1]?.travelMode;
    const profile = mode === 'WALKING' ? 'walking' : mode === 'CYCLING' ? 'cycling' : 'driving';
    const result = await mapService.calculateRoute({
      coordinates: day.itineraries.map(({ destination }) => ({
        latitude: Number(destination.latitude), longitude: Number(destination.longitude),
      })), profile, overview: 'full', geometries: 'geojson', steps: false, alternatives: false,
    });
    sendSuccess(res, result);
  }
);

// Public: token is the only credential required to view a shared trip.
router.get(
  '/shared/:shareToken',
  validate(shareTokenParamsSchema, 'params'),
  tripController.getSharedTrip
);

router.use(authenticate);
router.use('/:tripId/expenses', expenseRoutes);

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
