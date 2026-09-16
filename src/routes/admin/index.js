const router = require('express').Router();

// ─── Shared Swagger component schemas ────────────────────────────
/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             details:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     type: string
 *                 - type: string
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         club:
 *           type: string
 *         isTeamEvent:
 *           type: boolean
 *         minTeamSize:
 *           type: integer
 *           nullable: true
 *         maxTeamSize:
 *           type: integer
 *           nullable: true
 *         price:
 *           type: integer
 *         paymentTrigger:
 *           type: string
 *           enum: [before_registration, after_round, free]
 *         registrationEndTime:
 *           type: string
 *           format: date-time
 *         isPaid:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Registration:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         eventId:
 *           type: string
 *         userId:
 *           type: string
 *           nullable: true
 *         teamId:
 *           type: integer
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [registered, in_round, shortlisted, eliminated, confirmed, cancelled]
 *         metadata:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         eventId:
 *           type: string
 *         leaderId:
 *           type: string
 *         teamCode:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     EventRound:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         eventId:
 *           type: string
 *         roundNumber:
 *           type: integer
 *         name:
 *           type: string
 *           nullable: true
 *         roundEndTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ─── Sub-routers ─────────────────────────────────────────────────

// TODO: Plug in authentication/authorization middleware here once RBAC is ready.
// Example:
//   const { requireAdmin } = require('../../middleware/auth');
//   router.use(requireAdmin);

const dashboardRoutes = require('./dashboard.routes');
const eventRoutes = require('./event.routes');
const registrationRoutes = require('./registration.routes');
const teamRoutes = require('./team.routes');
const roundRoutes = require('./round.routes');
const resultRoutes = require('./result.routes');

router.use('/dashboard', dashboardRoutes);
router.use('/events', eventRoutes);

// Registration & Team routes use mixed paths (events/:id/... and registrations/:id, teams/:id)
// so they are mounted at the admin root.
router.use('/', registrationRoutes);
router.use('/', teamRoutes);

// Round routes also mix /events/:id/rounds and /rounds/:id
router.use('/', roundRoutes);

// Result routes: /events/:id/results and /rounds/:id/promote
router.use('/', resultRoutes);

module.exports = router;
