const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. FEST
  const fest = await prisma.fest.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'TantraFiesta',
      year: 2026,
      stDate: new Date('2026-10-10T00:00:00Z'),
      endDate: new Date('2026-10-12T00:00:00Z'),
      venue: 'Main Campus',
      status: 'active',
    },
  });
  console.log(`✓ Fest created: ${fest.name}`);

  // 2. USERS
  const usersToCreate = [
    { id: 'user_t_leader1', firstName: 'Alice', lastName: 'TeamAlpha', email: 'alice@alpha.com', role: 'participant' },
    { id: 'user_t_member1', firstName: 'Bob', lastName: 'TeamAlpha', email: 'bob@alpha.com', role: 'participant' },
    { id: 'user_t_leader2', firstName: 'Charlie', lastName: 'TeamBeta', email: 'charlie@beta.com', role: 'participant' },
    { id: 'user_t_member2', firstName: 'Diana', lastName: 'TeamBeta', email: 'diana@beta.com', role: 'participant' },
    { id: 'user_i_1', firstName: 'Eve', lastName: 'Solo', email: 'eve@solo.com', role: 'participant' },
    { id: 'user_i_2', firstName: 'Frank', lastName: 'Solo', email: 'frank@solo.com', role: 'participant' },
    { id: 'user_i_3', firstName: 'Grace', lastName: 'Solo', email: 'grace@solo.com', role: 'participant' },
    { id: 'user_admin', firstName: 'Admin', lastName: 'User', email: 'admin@fest.com', role: 'event_admin' },
  ];

  for (const u of usersToCreate) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        verified: true,
      },
    });
  }
  console.log(`✓ ${usersToCreate.length} Users created`);

  // 3. EVENTS
  const teamEvent = await prisma.eventnew.upsert({
    where: { id: 'evt_team_hackathon' },
    update: {},
    create: {
      id: 'evt_team_hackathon',
      name: 'Hackathon 2026',
      club: 'Coding Club',
      festId: fest.id,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      price: 100,
      paymentTrigger: 'before_registration',
      paymentRound: 'ROUND_1',
      registrationEndTime: new Date('2026-10-01T00:00:00Z'),
      isPaid: true,
    },
  });

  const indEvent = await prisma.eventnew.upsert({
    where: { id: 'evt_ind_quiz' },
    update: {},
    create: {
      id: 'evt_ind_quiz',
      name: 'Tech Quiz',
      club: 'Quiz Club',
      festId: fest.id,
      isTeamEvent: false,
      minTeamSize: null,
      maxTeamSize: null,
      price: 0,
      paymentTrigger: 'free',
      paymentRound: 'ROUND_1',
      registrationEndTime: new Date('2026-10-01T00:00:00Z'),
      isPaid: false,
    },
  });
  console.log(`✓ 2 Events created (Team & Individual)`);

  // 4. ROUNDS
  // Team Event Rounds
  const tr1 = await prisma.eventRound.upsert({
    where: { eventId_roundNumber: { eventId: teamEvent.id, roundNumber: 1 } },
    update: {},
    create: { eventId: teamEvent.id, roundNumber: 1, name: 'Idea Submission', roundEndTime: new Date('2026-10-02T00:00:00Z') },
  });
  const tr2 = await prisma.eventRound.upsert({
    where: { eventId_roundNumber: { eventId: teamEvent.id, roundNumber: 2 } },
    update: {},
    create: { eventId: teamEvent.id, roundNumber: 2, name: 'Prototype Demo', roundEndTime: new Date('2026-10-10T00:00:00Z') },
  });
  
  // Individual Event Rounds
  const ir1 = await prisma.eventRound.upsert({
    where: { eventId_roundNumber: { eventId: indEvent.id, roundNumber: 1 } },
    update: {},
    create: { eventId: indEvent.id, roundNumber: 1, name: 'Online Qualifier', roundEndTime: new Date('2026-10-02T00:00:00Z') },
  });
  const ir2 = await prisma.eventRound.upsert({
    where: { eventId_roundNumber: { eventId: indEvent.id, roundNumber: 2 } },
    update: {},
    create: { eventId: indEvent.id, roundNumber: 2, name: 'Finals', roundEndTime: new Date('2026-10-11T00:00:00Z') },
  });
  console.log(`✓ Rounds created`);

  // 5. TEAMS & TEAM MEMBERS
  const teamAlpha = await prisma.teamnew.upsert({
    where: { teamCode: 'ALPHA_HACK' },
    update: {},
    create: {
      name: 'Team Alpha',
      eventId: teamEvent.id,
      leaderId: 'user_t_leader1',
      teamCode: 'ALPHA_HACK',
    },
  });
  await prisma.teamMembernew.upsert({
    where: { teamId_userId: { teamId: teamAlpha.id, userId: 'user_t_member1' } },
    update: {},
    create: { teamId: teamAlpha.id, userId: 'user_t_member1' },
  });

  const teamBeta = await prisma.teamnew.upsert({
    where: { teamCode: 'BETA_HACK' },
    update: {},
    create: {
      name: 'Team Beta',
      eventId: teamEvent.id,
      leaderId: 'user_t_leader2',
      teamCode: 'BETA_HACK',
    },
  });
  await prisma.teamMembernew.upsert({
    where: { teamId_userId: { teamId: teamBeta.id, userId: 'user_t_member2' } },
    update: {},
    create: { teamId: teamBeta.id, userId: 'user_t_member2' },
  });
  console.log(`✓ Teams & Members created`);

  // 6. REGISTRATIONS
  // Team registrations
  await prisma.registrationnew.upsert({
    where: { eventId_teamId: { eventId: teamEvent.id, teamId: teamAlpha.id } },
    update: {},
    create: { eventId: teamEvent.id, teamId: teamAlpha.id, status: 'registered' },
  });
  await prisma.registrationnew.upsert({
    where: { eventId_teamId: { eventId: teamEvent.id, teamId: teamBeta.id } },
    update: {},
    create: { eventId: teamEvent.id, teamId: teamBeta.id, status: 'registered' },
  });

  // Individual registrations
  const indUsers = ['user_i_1', 'user_i_2', 'user_i_3'];
  for (const uid of indUsers) {
    await prisma.registrationnew.upsert({
      where: { eventId_userId: { eventId: indEvent.id, userId: uid } },
      update: {},
      create: { eventId: indEvent.id, userId: uid, status: 'registered' },
    });
  }
  console.log(`✓ Registrations created`);

  // 7. ROUND SELECTIONS (Results for Round 1)
  // Team Event R1: Team Alpha members (promoted), Team Beta members (eliminated)
  const teamR1Selections = [
    { uid: 'user_t_leader1', selected: true },
    { uid: 'user_t_member1', selected: true },
    { uid: 'user_t_leader2', selected: false },
    { uid: 'user_t_member2', selected: false },
  ];
  for (const sel of teamR1Selections) {
    await prisma.roundSelection.upsert({
      where: { eventRoundId_userId: { eventRoundId: tr1.id, userId: sel.uid } },
      update: {},
      create: { eventRoundId: tr1.id, userId: sel.uid, selected: sel.selected, notes: sel.selected ? 'Great idea' : 'Idea too vague' },
    });
  }

  // Individual Event R1: user_i_1 & user_i_3 (promoted), user_i_2 (eliminated)
  const indR1Selections = [
    { uid: 'user_i_1', selected: true },
    { uid: 'user_i_2', selected: false },
    { uid: 'user_i_3', selected: true },
  ];
  for (const sel of indR1Selections) {
    await prisma.roundSelection.upsert({
      where: { eventRoundId_userId: { eventRoundId: ir1.id, userId: sel.uid } },
      update: {},
      create: { eventRoundId: ir1.id, userId: sel.uid, selected: sel.selected, notes: 'Score: ' + (sel.selected ? '85' : '40') },
    });
  }
  console.log(`✓ Round 1 Selections created for both events`);

  console.log('\\n==========================================');
  console.log('SEED DATA SUMMARY (FOR ADMIN TESTING)');
  console.log('==========================================');
  console.log('Team Event (eventId):     ', teamEvent.id);
  console.log(`- Round 1 (roundId):      ${tr1.id}`);
  console.log(`- Round 2 (roundId):      ${tr2.id}`);
  console.log(`- Teams: Team Alpha (id: ${teamAlpha.id}) [Promoted in R1]`);
  console.log(`         Team Beta  (id: ${teamBeta.id})  [Eliminated in R1]`);
  console.log('');
  console.log('Individual Event (eventId):', indEvent.id);
  console.log(`- Round 1 (roundId):      ${ir1.id}`);
  console.log(`- Round 2 (roundId):      ${ir2.id}`);
  console.log(`- Users (user_i_1, user_i_3 promoted in R1, user_i_2 eliminated)`);
  console.log('==========================================\\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
