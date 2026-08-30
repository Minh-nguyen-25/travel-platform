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
exports.adminDestinationRoutes = void 0;
const express_1 = require("express");
const destinationController = __importStar(require("../controllers/destination.controller"));
const constants_1 = require("../constants");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const destination_validator_1 = require("../validators/destination.validator");
const destinationRoutes = (0, express_1.Router)();
destinationRoutes.get('/', (0, validate_middleware_1.validate)(destination_validator_1.destinationListQuerySchema, 'query'), destinationController.getDestinations);
destinationRoutes.get('/:destinationId', (0, validate_middleware_1.validate)(destination_validator_1.destinationIdParamsSchema, 'params'), destinationController.getDestination);
exports.adminDestinationRoutes = (0, express_1.Router)();
exports.adminDestinationRoutes.use(auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(constants_1.ROLE.ADMIN));
exports.adminDestinationRoutes.get('/', (0, validate_middleware_1.validate)(destination_validator_1.adminDestinationListQuerySchema, 'query'), destinationController.getAdminDestinations);
exports.adminDestinationRoutes.post('/', upload_middleware_1.uploadMultiple, (0, validate_middleware_1.validate)(destination_validator_1.createDestinationSchema), destinationController.createDestination);
exports.adminDestinationRoutes.get('/:destinationId', (0, validate_middleware_1.validate)(destination_validator_1.destinationIdParamsSchema, 'params'), destinationController.getAdminDestination);
exports.adminDestinationRoutes.patch('/:destinationId', (0, validate_middleware_1.validate)(destination_validator_1.destinationIdParamsSchema, 'params'), upload_middleware_1.uploadMultiple, (0, validate_middleware_1.validate)(destination_validator_1.updateDestinationSchema), destinationController.updateDestination);
exports.adminDestinationRoutes.delete('/:destinationId', (0, validate_middleware_1.validate)(destination_validator_1.destinationIdParamsSchema, 'params'), destinationController.deleteDestination);
exports.adminDestinationRoutes.post('/:destinationId/images', (0, validate_middleware_1.validate)(destination_validator_1.destinationIdParamsSchema, 'params'), upload_middleware_1.uploadMultiple, (0, validate_middleware_1.validate)(destination_validator_1.uploadDestinationImagesSchema), destinationController.uploadDestinationImages);
exports.adminDestinationRoutes.delete('/:destinationId/images/:imageId', (0, validate_middleware_1.validate)(destination_validator_1.destinationImageParamsSchema, 'params'), destinationController.deleteDestinationImage);
exports.adminDestinationRoutes.patch('/:destinationId/images/:imageId/primary', (0, validate_middleware_1.validate)(destination_validator_1.destinationImageParamsSchema, 'params'), destinationController.setPrimaryImage);
exports.default = destinationRoutes;
//# sourceMappingURL=destination.routes.js.map