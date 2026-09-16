const prisma = require('../../lib/prisma');
const { NotFoundError } = require('../../lib/errors');

/**
 * List events with optional pagination, search, and includes.
 */
async function listEvents({ page = 1, limit = 20, search = '' }) {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { club: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.eventnew.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        fest: { select: { id: true, name: true, year: true } },
        _count: {
          select: {
            registrations: true,
            teams: true,
            rounds: true,
          },
        },
      },
    }),
    prisma.eventnew.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single event by ID with full relations.
 */
async function getEventById(id) {
  const event = await prisma.eventnew.findUnique({
    where: { id },
    include: {
      fest: true,
      rounds: { orderBy: { roundNumber: 'asc' } },
      _count: {
        select: {
          registrations: true,
          teams: true,
        },
      },
    },
  });

  if (!event) throw new NotFoundError('Event', id);
  return event;
}

/**
 * Update an event by ID.
 */
async function updateEvent(id, data) {
  // Verify existence first
  const existing = await prisma.eventnew.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Event', id);

  const updated = await prisma.eventnew.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      fest: true,
      rounds: { orderBy: { roundNumber: 'asc' } },
      _count: { select: { registrations: true, teams: true } },
    },
  });

  return updated;
}

module.exports = { listEvents, getEventById, updateEvent };
