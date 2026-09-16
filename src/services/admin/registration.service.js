const prisma = require('../../lib/prisma');
const { NotFoundError } = require('../../lib/errors');

/**
 * List registrations for an event with pagination.
 */
async function getRegistrationsByEvent(eventId, { page = 1, limit = 20, status = '' }) {
  // Verify event exists
  const event = await prisma.eventnew.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event', eventId);

  const where = { eventId };
  if (status) {
    where.status = status;
  }

  const [registrations, total] = await Promise.all([
    prisma.registrationnew.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, collegeName: true } },
        team: { select: { id: true, name: true, teamCode: true } },
      },
    }),
    prisma.registrationnew.count({ where }),
  ]);

  return {
    eventId,
    registrations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single registration by ID.
 */
async function getRegistrationById(id) {
  const registration = await prisma.registrationnew.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, name: true, isTeamEvent: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true, collegeName: true, phoneNumber: true } },
      team: {
        select: {
          id: true,
          name: true,
          teamCode: true,
          leader: { select: { id: true, firstName: true, lastName: true, email: true } },
          members: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!registration) throw new NotFoundError('Registration', id);
  return registration;
}

module.exports = { getRegistrationsByEvent, getRegistrationById };
