const prisma = require('../../lib/prisma');
const { NotFoundError, ValidationError } = require('../../lib/errors');

/**
 * Get results (round selections) for an event, grouped by round.
 */
async function getResultsByEvent(eventId) {
  const event = await prisma.eventnew.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event', eventId);

  const rounds = await prisma.eventRound.findMany({
    where: { eventId },
    orderBy: { roundNumber: 'asc' },
    include: {
      selections: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              collegeName: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return {
    eventId,
    eventName: event.name,
    isTeamEvent: event.isTeamEvent,
    rounds: rounds.map((r) => ({
      roundId: r.id,
      roundNumber: r.roundNumber,
      name: r.name,
      roundEndTime: r.roundEndTime,
      selections: r.selections,
      totalSelections: r.selections.length,
      promoted: r.selections.filter((s) => s.selected).length,
      eliminated: r.selections.filter((s) => !s.selected).length,
    })),
  };
}

/**
 * Promote participants or teams to a round.
 *
 * The endpoint auto-detects whether to expect userIds or teamIds based on
 * the event's isTeamEvent flag.
 *
 * - Individual events: accepts { userIds: [...] }
 * - Team events:       accepts { teamIds: [...] }
 *   → resolves all team members and creates RoundSelection entries for each.
 */
async function promoteToRound(roundId, { userIds, teamIds, notes }) {
  // 1. Fetch the round and its event
  const round = await prisma.eventRound.findUnique({
    where: { id: roundId },
    include: {
      event: { select: { id: true, name: true, isTeamEvent: true } },
    },
  });
  if (!round) throw new NotFoundError('EventRound', roundId);

  const { event } = round;
  const isTeam = event.isTeamEvent;

  // 2. Validate the correct identifiers are provided
  if (isTeam) {
    if (!teamIds || teamIds.length === 0) {
      throw new ValidationError(
        `This is a team event. Please provide "teamIds" to promote.`
      );
    }
    if (userIds && userIds.length > 0) {
      throw new ValidationError(
        `This is a team event. Use "teamIds" instead of "userIds".`
      );
    }
  } else {
    if (!userIds || userIds.length === 0) {
      throw new ValidationError(
        `This is an individual event. Please provide "userIds" to promote.`
      );
    }
    if (teamIds && teamIds.length > 0) {
      throw new ValidationError(
        `This is an individual event. Use "userIds" instead of "teamIds".`
      );
    }
  }

  // 3. Resolve the user IDs to promote
  let resolvedUserIds = [];

  if (isTeam) {
    // Fetch all members of the specified teams (that belong to this event)
    const teams = await prisma.teamnew.findMany({
      where: {
        id: { in: teamIds },
        eventId: event.id,
      },
      include: {
        members: { select: { userId: true } },
      },
    });

    // Check for invalid team IDs
    const foundTeamIds = teams.map((t) => t.id);
    const invalidTeamIds = teamIds.filter((tid) => !foundTeamIds.includes(tid));
    if (invalidTeamIds.length > 0) {
      throw new ValidationError(
        `Teams not found for this event: ${invalidTeamIds.join(', ')}`
      );
    }

    // Collect all member user IDs + leader IDs
    for (const team of teams) {
      resolvedUserIds.push(team.leaderId);
      for (const member of team.members) {
        resolvedUserIds.push(member.userId);
      }
    }
    // De-duplicate
    resolvedUserIds = [...new Set(resolvedUserIds)];
  } else {
    // Verify the users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });
    const foundIds = users.map((u) => u.id);
    const invalidIds = userIds.filter((uid) => !foundIds.includes(uid));
    if (invalidIds.length > 0) {
      throw new ValidationError(
        `Users not found: ${invalidIds.join(', ')}`
      );
    }
    resolvedUserIds = userIds;
  }

  // 4. Upsert RoundSelection entries (selected = true)
  const results = await prisma.$transaction(
    resolvedUserIds.map((userId) =>
      prisma.roundSelection.upsert({
        where: {
          eventRoundId_userId: {
            eventRoundId: roundId,
            userId,
          },
        },
        update: {
          selected: true,
          notes: notes || null,
          decidedAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          eventRoundId: roundId,
          userId,
          selected: true,
          notes: notes || null,
          decidedAt: new Date(),
        },
      })
    )
  );

  return {
    roundId,
    roundNumber: round.roundNumber,
    eventId: event.id,
    eventName: event.name,
    isTeamEvent: isTeam,
    promotedCount: results.length,
    promotedUserIds: resolvedUserIds,
    ...(isTeam ? { teamIds } : {}),
  };
}

module.exports = { getResultsByEvent, promoteToRound };
