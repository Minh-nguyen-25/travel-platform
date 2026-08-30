"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRepository = void 0;
const db_1 = __importDefault(require("../config/db"));
const categoryInclude = {
    _count: { select: { destinations: true } },
};
exports.categoryRepository = {
    async findMany(query) {
        const where = query.search
            ? {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ],
            }
            : {};
        const orderBy = [
            { [query.sortBy]: query.sortOrder },
            { id: query.sortOrder },
        ];
        const [data, total] = await db_1.default.$transaction([
            db_1.default.category.findMany({
                where,
                include: categoryInclude,
                orderBy,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            db_1.default.category.count({ where }),
        ]);
        return { data, total };
    },
    findById(id) {
        return db_1.default.category.findUnique({
            where: { id },
            include: categoryInclude,
        });
    },
    findByNameInsensitive(name, excludeId) {
        return db_1.default.category.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                ...(excludeId !== undefined && { id: { not: excludeId } }),
            },
            select: { id: true },
        });
    },
    create(input) {
        return db_1.default.category.create({
            data: {
                name: input.name,
                description: input.description ?? null,
            },
            include: categoryInclude,
        });
    },
    update(id, input) {
        return db_1.default.category.update({
            where: { id },
            data: input,
            include: categoryInclude,
        });
    },
    delete(id) {
        return db_1.default.category.delete({
            where: { id },
            include: categoryInclude,
        });
    },
};
//# sourceMappingURL=category.repository.js.map