"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tripController = __importStar(require("../controllers/trip.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const trip_validator_1 = require("../validators/trip.validator");
const router = (0, express_1.Router)();
// Public: token is the only credential required to view a shared trip.
router.get('/shared/:shareToken', (0, validate_middleware_1.validate)(trip_validator_1.shareTokenParamsSchema, 'params'), tripController.getSharedTrip);
router.use(auth_middleware_1.authenticate);
router.get('/', (0, validate_middleware_1.validate)(trip_validator_1.tripListQuerySchema, 'query'), tripController.getTrips);
router.post('/', (0, validate_middleware_1.validate)(trip_validator_1.createTripSchema), tripController.createTrip);
router.get('/:tripId/cost-summary', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), tripController.getCostSummary);
router.post('/:tripId/share', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), tripController.enableTripShare);
router.delete('/:tripId/share', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), tripController.disableTripShare);
router.get('/:tripId/days', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), tripController.getTripDays);
router.post('/:tripId/days', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), (0, validate_middleware_1.validate)(trip_validator_1.createTripDaySchema), tripController.createTripDay);
router.get('/:tripId/days/:dayId/itineraries', (0, validate_middleware_1.validate)(trip_validator_1.tripDayParamsSchema, 'params'), tripController.getItineraries);
router.post('/:tripId/days/:dayId/itineraries', (0, validate_middleware_1.validate)(trip_validator_1.tripDayParamsSchema, 'params'), (0, validate_middleware_1.validate)(trip_validator_1.createItinerarySchema), tripController.createItinerary);
router.put('/:tripId/days/:dayId/itineraries/order', (0, validate_middleware_1.validate)(trip_validator_1.tripDayParamsSchema, 'params'), (0, validate_middleware_1.validate)(trip_validator_1.reorderItinerariesSchema), tripController.reorderItineraries);
router.get('/:tripId/days/:dayId/itineraries/:itineraryId', (0, validate_middleware_1.validate)(trip_validator_1.itineraryParamsSchema, 'params'), tripController.getItinerary);
router.patch('/:tripId/days/:dayId/itineraries/:itineraryId', (0, validate_middleware_1.validate)(trip_validator_1.itineraryParamsSchema, 'params'), (0, validate_middleware_1.validate)(trip_validator_1.updateItinerarySchema), tripController.updateItinerary);
router.delete('/:tripId/days/:dayId/itineraries/:itineraryId', (0, validate_middleware_1.validate)(trip_validator_1.itineraryParamsSchema, 'params'), tripController.deleteItinerary);
router.get('/:tripId/days/:dayId', (0, validate_middleware_1.validate)(trip_validator_1.tripDayParamsSchema, 'params'), tripController.getTripDay);
router.patch('/:tripId/days/:dayId', (0, validate_middleware_1.validate)(trip_validator_1.tripDayParamsSchema, 'params'), (0, validate_middleware_1.validate)(trip_validator_1.updateTripDaySchema), tripController.updateTripDay);
router.delete('/:tripId/days/:dayId', (0, validate_middleware_1.validate)(trip_validator_1.tripDayParamsSchema, 'params'), tripController.deleteTripDay);
router.get('/:tripId', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), tripController.getTrip);
router.patch('/:tripId', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), (0, validate_middleware_1.validate)(trip_validator_1.updateTripSchema), tripController.updateTrip);
router.delete('/:tripId', (0, validate_middleware_1.validate)(trip_validator_1.tripIdParamsSchema, 'params'), tripController.deleteTrip);
exports.default = router;
//# sourceMappingURL=trip.routes.js.map