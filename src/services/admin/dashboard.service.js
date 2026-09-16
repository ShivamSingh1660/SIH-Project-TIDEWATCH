const prisma = require('../../lib/prisma');

/**
 * Aggregate dashboard statistics.
 */
async function getDashboardStats() {
  const [totalEvents, totalRegistrations, totalTeams, totalUsers, recentRegistrations] =
    await Promise.all([
      prisma.eventnew.count(),
      prisma.registrationnew.count(),
      prisma.teamnew.count(),
      prisma.user.count(),
      prisma.registrationnew.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          team: { select: { id: true, name: true } },
        },
      }),
    ]);

  // Per-event registration counts
  const perEventStats = await prisma.eventnew.findMany({
    select: {
      id: true,
      name: true,
      club: true,
      isTeamEvent: true,
      _count: {
        select: {
          registrations: true,
          teams: true,
          rounds: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return {
    totals: {
      events: totalEvents,
      registrations: totalRegistrations,
      teams: totalTeams,
      users: totalUsers,
    },
    recentRegistrations,
    perEventStats,
  };
}

module.exports = { getDashboardStats };
