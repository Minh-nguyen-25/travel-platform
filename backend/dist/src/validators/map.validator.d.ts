import { z } from 'zod';
export declare const distanceRequestSchema: z.ZodObject<{
    origin: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>;
    destination: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>;
    profile: z.ZodOptional<z.ZodEnum<["driving", "walking", "cycling"]>>;
}, "strict", z.ZodTypeAny, {
    destination: {
        latitude: number;
        longitude: number;
    };
    origin: {
        latitude: number;
        longitude: number;
    };
    profile?: "driving" | "walking" | "cycling" | undefined;
}, {
    destination: {
        latitude: number;
        longitude: number;
    };
    origin: {
        latitude: number;
        longitude: number;
    };
    profile?: "driving" | "walking" | "cycling" | undefined;
}>;
export declare const routeRequestSchema: z.ZodObject<{
    coordinates: z.ZodArray<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>, "many">;
    profile: z.ZodOptional<z.ZodEnum<["driving", "walking", "cycling"]>>;
    alternatives: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber]>>;
    steps: z.ZodOptional<z.ZodBoolean>;
    overview: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<false>, z.ZodEnum<["simplified", "full"]>]>>;
    geometries: z.ZodOptional<z.ZodEnum<["polyline", "polyline6", "geojson"]>>;
}, "strict", z.ZodTypeAny, {
    coordinates: {
        latitude: number;
        longitude: number;
    }[];
    profile?: "driving" | "walking" | "cycling" | undefined;
    overview?: false | "simplified" | "full" | undefined;
    geometries?: "polyline" | "polyline6" | "geojson" | undefined;
    alternatives?: number | boolean | undefined;
    steps?: boolean | undefined;
}, {
    coordinates: {
        latitude: number;
        longitude: number;
    }[];
    profile?: "driving" | "walking" | "cycling" | undefined;
    overview?: false | "simplified" | "full" | undefined;
    geometries?: "polyline" | "polyline6" | "geojson" | undefined;
    alternatives?: number | boolean | undefined;
    steps?: boolean | undefined;
}>;
export declare const routeMatrixRequestSchema: z.ZodObject<{
    coordinates: z.ZodArray<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>, "many">;
    profile: z.ZodOptional<z.ZodEnum<["driving", "walking", "cycling"]>>;
    sources: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>;
    destinations: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>;
}, "strict", z.ZodTypeAny, {
    coordinates: {
        latitude: number;
        longitude: number;
    }[];
    profile?: "driving" | "walking" | "cycling" | undefined;
    destinations?: number[] | undefined;
    sources?: number[] | undefined;
}, {
    coordinates: {
        latitude: number;
        longitude: number;
    }[];
    profile?: "driving" | "walking" | "cycling" | undefined;
    destinations?: number[] | undefined;
    sources?: number[] | undefined;
}>;
export type DistanceRequestInput = z.infer<typeof distanceRequestSchema>;
//# sourceMappingURL=map.validator.d.ts.map