import { z } from 'zod';

const coordinateSchema = z
  .object({
    latitude: z
      .number({ invalid_type_error: 'latitude phải là số' })
      .finite('latitude phải là số hữu hạn')
      .min(-90, 'latitude phải từ -90 đến 90')
      .max(90, 'latitude phải từ -90 đến 90'),
    longitude: z
      .number({ invalid_type_error: 'longitude phải là số' })
      .finite('longitude phải là số hữu hạn')
      .min(-180, 'longitude phải từ -180 đến 180')
      .max(180, 'longitude phải từ -180 đến 180'),
  })
  .strict();

const profileSchema = z.enum(['driving', 'walking', 'cycling']);

const coordinatesSchema = z
  .array(coordinateSchema)
  .min(2, 'Cần cung cấp ít nhất 2 tọa độ')
  .max(100, 'Mỗi yêu cầu chỉ hỗ trợ tối đa 100 tọa độ');

export const distanceRequestSchema = z
  .object({
    origin: coordinateSchema,
    destination: coordinateSchema,
    profile: profileSchema.optional(),
  })
  .strict();

export const routeRequestSchema = z
  .object({
    coordinates: coordinatesSchema,
    profile: profileSchema.optional(),
    alternatives: z.union([z.boolean(), z.number().int().min(1).max(3)]).optional(),
    steps: z.boolean().optional(),
    overview: z.union([z.literal(false), z.enum(['simplified', 'full'])]).optional(),
    geometries: z.enum(['polyline', 'polyline6', 'geojson']).optional(),
  })
  .strict();

const matrixIndexesSchema = z
  .array(z.number().int().nonnegative())
  .min(1)
  .max(100)
  .refine((indexes) => new Set(indexes).size === indexes.length, {
    message: 'Danh sách chỉ số tọa độ không được trùng lặp',
  });

export const routeMatrixRequestSchema = z
  .object({
    coordinates: coordinatesSchema,
    profile: profileSchema.optional(),
    sources: matrixIndexesSchema.optional(),
    destinations: matrixIndexesSchema.optional(),
  })
  .strict();

export type DistanceRequestInput = z.infer<typeof distanceRequestSchema>;
