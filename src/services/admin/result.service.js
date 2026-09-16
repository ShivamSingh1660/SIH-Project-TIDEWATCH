const prisma = require('../../lib/prisma');
const { NotFoundError, ValidationError } = require('../../lib/errors');

/**
 * Get results (round selections) for an event, grouped by round.
 */
async function getResultsByEvent(eventId, roundId) {
  const event = await prisma.eventnew.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event', eventId);

  const round = await prisma.eventRound.findFirst({
    where: { id: roundId, eventId },
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

  if (!round) {
    throw new NotFoundError(`EventRound ${roundId} for Event`, eventId);
  }

  let formattedSelections = [];
  let totalSelections = 0;
  let promoted = 0;
  let eliminated = 0;

  if (event.isTeamEvent) {
    const teams = await prisma.teamnew.findMany({
      where: { eventId },
      include: { members: { select: { userId: true } } },
    });

    const userToSelectionMap = new Map();
    for (const sel of round.selections) {
      userToSelectionMap.set(sel.userId, sel);
    }

    for (const team of teams) {
      let teamSelection = userToSelectionMap.get(team.leaderId);
      if (!teamSelection) {
        for (const member of team.members) {
          if (userToSelectionMap.has(member.userId)) {
            teamSelection = userToSelectionMap.get(member.userId);
            break;
          }
        }
      }

      if (teamSelection) {
        const isQualified = teamSelection.selected;
        if (isQualified) promoted++;
        else eliminated++;

        formattedSelections.push({
          teamId: team.id,
          teamName: team.name,
          teamCode: team.teamCode,
          status: isQualified ? 'QUALIFIED' : 'DISQUALIFIED',
          notes: teamSelection.notes,
        });
      }
    }
    totalSelections = formattedSelections.length;
  } else {
    formattedSelections = round.selections.map(s => ({
      ...s,
      status: s.selected ? 'QUALIFIED' : 'DISQUALIFIED'
    }));
    totalSelections = round.selections.length;
    promoted = round.selections.filter((s) => s.selected).length;
    eliminated = round.selections.filter((s) => !s.selected).length;
  }

  return {
    eventId,
    eventName: event.name,
    isTeamEvent: event.isTeamEvent,
    roundId: round.id,
    roundNumber: round.roundNumber,
    name: round.name,
    roundEndTime: round.roundEndTime,
    selections: formattedSelections,
    totalSelections,
    promoted,
    eliminated,
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
async function promoteToRound(eventId, roundId, { userIds, teamIds, notes }) {
  // 1. Fetch the round and its event
  const round = await prisma.eventRound.findFirst({
    where: { id: roundId, eventId },
    include: {
      event: { select: { id: true, name: true, isTeamEvent: true } },
    },
  });
  if (!round) throw new NotFoundError(`EventRound ${roundId} for Event`, eventId);

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
