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
const aiChatTripSelect = {
    id: true,
    name: true,
    destinationCity: true,
    startDate: true,
    endDate: true,
    budget: true,
    numberOfPeople: true,
    description: true,
    isAiGenerated: true,
    tripDays: {
        orderBy: { dayNumber: 'asc' },
        take: 14,
        select: {
            dayNumber: true,
            date: true,
            note: true,
            itineraries: {
                orderBy: { sequenceOrder: 'asc' },
                take: 8,
                select: {
                    startTime: true,
                    endTime: true,
                    estimatedCost: true,
                    travelMode: true,
                    note: true,
                    destination: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            },
        },
    },
};
const aiChatDestinationSelect = {
    id: true,
    name: true,
    address: true,
    description: true,
    ticketPrice: true,
    openingHoursNote: true,
    visitDuration: true,
    rating: true,
    categories: { select: { category: { select: { name: true } } } },
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
    findUserTripsForChat(userId, limit) {
        return db_1.default.trip.findMany({
            where: { userId },
            select: aiChatTripSelect,
            orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    },
    findDestinationsForChat(limit) {
        return db_1.default.destination.findMany({
            where: { isActive: true },
            select: aiChatDestinationSelect,
            orderBy: [{ rating: 'desc' }, { id: 'asc' }],
            take: limit,
        });
    },
};
//# sourceMappingURL=ai.repository.js.map