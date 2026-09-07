import { AiConfig } from '../config/ai';
import { AiChatInput, AiChatResult, AiItineraryGenerationResult, GenerateItineraryInput } from '../types/ai.types';
import { AiRepository } from '../repositories/ai.repository';
import { OsrmMapService } from './map.service';
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type RoutingService = Pick<OsrmMapService, 'calculateMatrix' | 'getProfileForTravelMode'>;
export declare class AiService {
    private readonly repository;
    private readonly routingService;
    private readonly configFactory;
    private readonly fetchImpl;
    constructor(repository?: AiRepository, routingService?: RoutingService, configFactory?: () => AiConfig, fetchImpl?: FetchLike);
    private fetchJson;
    private callOpenAi;
    private callOpenAiChat;
    private callGemini;
    private callGeminiChat;
    private enrichRoutes;
    chat(userId: number, rawInput: AiChatInput): Promise<AiChatResult>;
    generateItinerary(userId: number, input: GenerateItineraryInput): Promise<AiItineraryGenerationResult>;
}
export declare const aiService: AiService;
export {};
//# sourceMappingURL=ai.service.d.ts.map