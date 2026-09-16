const router = require('express').Router();
const validate = require('../../lib/validate');
const {
  eventIdParam,
  teamIdParam,
  paginationQuery,
} = require('../../validators/admin.validators');
const {
  getTeamsByEvent,
  getTeam,
} = require('../../controllers/admin/team.controller');

/**
 * @swagger
 * /api/admin/events/{id}/teams:
 *   get:
 *     tags: [Teams]
 *     summary: List teams for an event
 *     description: Returns a paginated list of teams for a specific event.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by team name or team code
 *     responses:
 *       200:
 *         description: Paginated team list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     teams:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Team'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/events/:id/teams',
  validate({ params: eventIdParam, query: paginationQuery }),
  getTeamsByEvent
);

/**
 * @swagger
 * /api/admin/teams/{id}:
 *   get:
 *     tags: [Teams]
 *     summary: Get team details
 *     description: Returns a single team with leader, all members, and registration info.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/teams/:id', validate({ params: teamIdParam }), getTeam);

module.exports = router;
