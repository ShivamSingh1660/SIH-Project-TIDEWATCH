const prisma = require('../../lib/prisma');
const { NotFoundError } = require('../../lib/errors');

/**
 * List teams for an event with pagination.
 */
async function getTeamsByEvent(eventId, { page = 1, limit = 20, search = '' }) {
  const event = await prisma.eventnew.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event', eventId);

  const where = { eventId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { teamCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [teams, total] = await Promise.all([
    prisma.teamnew.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { members: true } },
      },
    }),
    prisma.teamnew.count({ where }),
  ]);

  return {
    eventId,
    teams,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single team by ID with full member list.
 */
async function getTeamById(id) {
  const team = await prisma.teamnew.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, name: true, isTeamEvent: true } },
      leader: { select: { id: true, firstName: true, lastName: true, email: true, collegeName: true } },
      members: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, collegeName: true } },
        },
      },
      registrations: {
        select: { id: true, status: true, createdAt: true },
      },
    },
  });

  if (!team) throw new NotFoundError('Team', id);
  return team;
}

module.exports = { getTeamsByEvent, getTeamById };
