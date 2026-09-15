import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import {
  getChatSearchTerms,
  rankDestinationsForChat,
  VIETNAMESE_SQL_FROM,
  VIETNAMESE_SQL_TO,
} from '../utils/ai-search';

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
} satisfies Prisma.DestinationSelect;

const aiPreferenceSelect = {
  budgetLevel: true,
  travelStyle: true,
  preferredActivities: true,
  preferredCategories: true,
} satisfies Prisma.TravelPreferenceSelect;

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
    orderBy: { dayNumber: 'asc' as const },
    take: 14,
    select: {
      dayNumber: true,
      date: true,
      note: true,
      itineraries: {
        orderBy: { sequenceOrder: 'asc' as const },
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
} satisfies Prisma.TripSelect;

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
} satisfies Prisma.DestinationSelect;

export type AiDestinationRecord = Prisma.DestinationGetPayload<{
  select: typeof aiDestinationSelect;
}>;

export type AiPreferenceRecord = Prisma.TravelPreferenceGetPayload<{
  select: typeof aiPreferenceSelect;
}>;

export type AiChatTripRecord = Prisma.TripGetPayload<{
  select: typeof aiChatTripSelect;
}>;

export type AiChatDestinationRecord = Prisma.DestinationGetPayload<{
  select: typeof aiChatDestinationSelect;
}>;

const foldSql = (field: Prisma.Sql): Prisma.Sql => Prisma.sql`
  translate(normalize(lower(coalesce(${field}, '')), NFC),
    ${VIETNAMESE_SQL_FROM}, ${VIETNAMESE_SQL_TO})
`;

export const searchChatDestinations = async (
  database: typeof prisma,
  query: string,
  limit: number
): Promise<AiChatDestinationRecord[]> => {
  const terms = getChatSearchTerms(query);
  if (terms.length === 0) {
    return database.destination.findMany({
      where: { isActive: true }, select: aiChatDestinationSelect,
      orderBy: [{ rating: 'desc' }, { id: 'asc' }], take: limit,
    });
  }

  const name = foldSql(Prisma.sql`d.name`);
  const address = foldSql(Prisma.sql`d.address`);
  const description = foldSql(Prisma.sql`d.description`);
  const scores = terms.map((term) => {
    const pattern = `%${term}%`;
    return Prisma.sql`(
      CASE WHEN ${name} LIKE ${pattern} THEN 5 ELSE 0 END +
      CASE WHEN ${address} LIKE ${pattern} THEN 4 ELSE 0 END +
      CASE WHEN EXISTS (
        SELECT 1 FROM destination_categories dc
        JOIN categories c ON c.id = dc.category_id
        WHERE dc.destination_id = d.id AND ${foldSql(Prisma.sql`c.name`)} LIKE ${pattern}
      ) THEN 3 ELSE 0 END +
      CASE WHEN ${description} LIKE ${pattern} THEN 1 ELSE 0 END
    )`;
  });
  const score = Prisma.join(scores, ' + ');
  const rows = await database.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT d.id FROM destinations d
    WHERE d.is_active = true AND (${score}) > 0
    ORDER BY (${score}) DESC, d.rating DESC, d.id ASC
    LIMIT ${Math.max(300, Math.min(limit * 20, 600))}
  `);
  const ids = rows.map(({ id }) => id);
  if (ids.length === 0) return [];
  const candidates = await database.destination.findMany({
    where: { isActive: true, id: { in: ids } },
    select: aiChatDestinationSelect,
  });
  return rankDestinationsForChat(candidates, query, limit);
};

export const aiRepository = {
  findPreference(userId: number): Promise<AiPreferenceRecord | null> {
    return prisma.travelPreference.findUnique({
      where: { userId },
      select: aiPreferenceSelect,
    });
  },

  findActiveDestinations(
    destinationCity: string,
    limit: number
  ): Promise<AiDestinationRecord[]> {
    return prisma.destination.findMany({
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

  findUserTripsForChat(userId: number, limit: number): Promise<AiChatTripRecord[]> {
    return prisma.trip.findMany({
      where: { userId },
      select: aiChatTripSelect,
      orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  },

  async findDestinationsForChat(query: string, limit: number): Promise<AiChatDestinationRecord[]> {
    return searchChatDestinations(prisma, query, limit);
  },
};

export type AiRepository = Pick<
  typeof aiRepository,
  | 'findPreference'
  | 'findActiveDestinations'
  | 'findUserTripsForChat'
  | 'findDestinationsForChat'
>;
