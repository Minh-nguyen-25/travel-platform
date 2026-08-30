"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeMatrixRequestSchema = exports.routeRequestSchema = exports.distanceRequestSchema = void 0;
const zod_1 = require("zod");
const coordinateSchema = zod_1.z
    .object({
    latitude: zod_1.z
        .number({ invalid_type_error: 'latitude phải là số' })
        .finite('latitude phải là số hữu hạn')
        .min(-90, 'latitude phải từ -90 đến 90')
        .max(90, 'latitude phải từ -90 đến 90'),
    longitude: zod_1.z
        .number({ invalid_type_error: 'longitude phải là số' })
        .finite('longitude phải là số hữu hạn')
        .min(-180, 'longitude phải từ -180 đến 180')
        .max(180, 'longitude phải từ -180 đến 180'),
})
    .strict();
const profileSchema = zod_1.z.enum(['driving', 'walking', 'cycling']);
const coordinatesSchema = zod_1.z
    .array(coordinateSchema)
    .min(2, 'Cần cung cấp ít nhất 2 tọa độ')
    .max(100, 'Mỗi yêu cầu chỉ hỗ trợ tối đa 100 tọa độ');
exports.distanceRequestSchema = zod_1.z
    .object({
    origin: coordinateSchema,
    destination: coordinateSchema,
    profile: profileSchema.optional(),
})
    .strict();
exports.routeRequestSchema = zod_1.z
    .object({
    coordinates: coordinatesSchema,
    profile: profileSchema.optional(),
    alternatives: zod_1.z.union([zod_1.z.boolean(), zod_1.z.number().int().min(1).max(3)]).optional(),
    steps: zod_1.z.boolean().optional(),
    overview: zod_1.z.union([zod_1.z.literal(false), zod_1.z.enum(['simplified', 'full'])]).optional(),
    geometries: zod_1.z.enum(['polyline', 'polyline6', 'geojson']).optional(),
})
    .strict();
const matrixIndexesSchema = zod_1.z
    .array(zod_1.z.number().int().nonnegative())
    .min(1)
    .max(100)
    .refine((indexes) => new Set(indexes).size === indexes.length, {
    message: 'Danh sách chỉ số tọa độ không được trùng lặp',
});
exports.routeMatrixRequestSchema = zod_1.z
    .object({
    coordinates: coordinatesSchema,
    profile: profileSchema.optional(),
    sources: matrixIndexesSchema.optional(),
    destinations: matrixIndexesSchema.optional(),
})
    .strict();
//# sourceMappingURL=map.validator.js.map