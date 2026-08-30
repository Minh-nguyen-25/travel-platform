import { DestinationRecord } from '../repositories/destination.repository';
import { CreateDestinationInput, DestinationListQuery, DestinationResponse, UpdateDestinationInput } from '../types/destination.types';
export declare const serializeDestination: (destination: DestinationRecord) => DestinationResponse;
export declare const destinationService: {
    getDestinations(query: DestinationListQuery, publicOnly?: boolean): Promise<{
        data: DestinationResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDestination(id: number, publicOnly?: boolean): Promise<DestinationResponse>;
    createDestination(input: CreateDestinationInput, files?: Express.Multer.File[], primaryImageIndex?: number): Promise<DestinationResponse>;
    updateDestination(id: number, input: UpdateDestinationInput, files?: Express.Multer.File[], primaryImageIndex?: number): Promise<DestinationResponse>;
    softDeleteDestination(id: number): Promise<DestinationResponse>;
    uploadDestinationImages(id: number, files: Express.Multer.File[], primaryImageIndex?: number): Promise<DestinationResponse>;
    deleteDestinationImage(destinationId: number, imageId: number): Promise<DestinationResponse>;
    setPrimaryImage(destinationId: number, imageId: number): Promise<DestinationResponse>;
};
//# sourceMappingURL=destination.service.d.ts.map