import { AiProvider } from '../types/ai.types';
export interface AiConfig {
    provider: AiProvider;
    apiKey: string;
    model: string;
    baseUrl: string;
    timeoutMs: number;
    maxRetries: number;
    maxOutputTokens: number;
    maxDestinationCandidates: number;
    routingEnabled: boolean;
    maxRoutingLegs: number;
    routingConcurrency: number;
    routingDeadlineMs: number;
    openAiOrganization: string | null;
    openAiProject: string | null;
}
export declare const getAiConfig: () => AiConfig;
//# sourceMappingURL=ai.d.ts.map