const prisma = require('../../lib/prisma');
const { NotFoundError, ValidationError } = require('../../lib/errors');

/**
 * List rounds for an event, ordered by roundNumber.
 */
async function getRoundsByEvent(eventId) {
  const event = await prisma.eventnew.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event', eventId);

  const rounds = await prisma.eventRound.findMany({
    where: { eventId },
    orderBy: { roundNumber: 'asc' },
    include: {
      _count: { select: { selections: true } },
    },
  });

  return { eventId, rounds };
}

/**
 * Create a new round for an event.
 */
async function createRound(eventId, { roundNumber, name, roundEndTime }) {
  const event = await prisma.eventnew.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event', eventId);

  // Check for duplicate round number
  const existing = await prisma.eventRound.findUnique({
    where: { eventId_roundNumber: { eventId, roundNumber } },
  });
  if (existing) {
    throw new ValidationError(
      `Round ${roundNumber} already exists for this event.`
    );
  }

  const round = await prisma.eventRound.create({
    data: {
      eventId,
      roundNumber,
      name: name || null,
      roundEndTime: new Date(roundEndTime),
    },
    include: {
      event: { select: { id: true, name: true } },
    },
  });

  return round;
}

/**
 * Update a round by ID.
 */
async function updateRound(eventId, roundId, data) {
  const existing = await prisma.eventRound.findFirst({
    where: { id: roundId, eventId },
  });
  if (!existing) throw new NotFoundError(`Round ${roundId} not found for Event`, eventId);

  const updateData = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name || null;
  if (data.roundEndTime !== undefined)
    updateData.roundEndTime = new Date(data.roundEndTime);

  const updated = await prisma.eventRound.update({
    where: { id: roundId },
    data: updateData,
    include: {
      event: { select: { id: true, name: true } },
      _count: { select: { selections: true } },
    },
  });

  return updated;
}

module.exports = { getRoundsByEvent, createRound, updateRound };
