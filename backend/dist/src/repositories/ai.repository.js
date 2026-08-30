"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRepository = void 0;
const db_1 = __importDefault(require("../config/db"));
const aiDestinationSelect = {
    id: true,
    name: true,
    description: true,
    address: true,
    latitude: true,
    longitude: true,
    ticketPrice: true,
    openingHoursNote: true,
    visitDuration: true,
    rating: true,
    categories: { select: { category: { select: { name: true } } } },
};
const aiPreferenceSelect = {
    budgetLevel: true,
    travelStyle: true,
    preferredActivities: true,
    preferredCategories: true,
};
exports.aiRepository = {
    findPreference(userId) {
        return db_1.default.travelPreference.findUnique({
            where: { userId },
            select: aiPreferenceSelect,
        });
    },
    findActiveDestinations(destinationCity, limit) {
        return db_1.default.destination.findMany({
            where: {
                isActive: true,
                OR: [
                    { address: { contains: destinationCity, mode: 'insensitive' } },
                    { name: { contains: destinationCity, mode: 'insensitive' } },
                ],
            },
            select: aiDestinationSelect,
            orderBy: [{ rating: 'desc' }, { id: 'asc' }],
            take: limit,
        });
    },
};
//# sourceMappingURL=ai.repository.js.map