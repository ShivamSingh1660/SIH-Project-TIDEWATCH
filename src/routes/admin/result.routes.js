const router = require('express').Router();
const validate = require('../../lib/validate');
const {
  eventIdParam,
  roundIdParam,
  promoteBody,
} = require('../../validators/admin.validators');
const {
  getResultsByEvent,
  promote,
} = require('../../controllers/admin/result.controller');

/**
 * @swagger
 * /api/admin/events/{id}/results:
 *   get:
 *     tags: [Results / Promotion]
 *     summary: Get results for an event
 *     description: Returns all round selections (promoted/eliminated) grouped by round, with user details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event results grouped by round
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
 *                     eventName:
 *                       type: string
 *                     isTeamEvent:
 *                       type: boolean
 *                     rounds:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           roundId:
 *                             type: integer
 *                           roundNumber:
 *                             type: integer
 *                           name:
 *                             type: string
 *                             nullable: true
 *                           totalSelections:
 *                             type: integer
 *                           promoted:
 *                             type: integer
 *                           eliminated:
 *                             type: integer
 *                           selections:
 *                             type: array
 *                             items:
 *                               type: object
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/events/:id/results',
  validate({ params: eventIdParam }),
  getResultsByEvent
);

/**
 * @swagger
 * /api/admin/rounds/{id}/promote:
 *   post:
 *     tags: [Results / Promotion]
 *     summary: Promote participants/teams to a round
 *     description: |
 *       Promotes participants or teams to the specified round. The API auto-detects
 *       whether to use `userIds` or `teamIds` based on the event's `isTeamEvent` flag.
 *
 *       - **Individual events**: provide `userIds` array. Creates RoundSelection entries for each user.
 *       - **Team events**: provide `teamIds` array. Resolves all team members and creates RoundSelection entries for every member.
 *
 *       Sending the wrong ID type (e.g., `userIds` for a team event) returns a 400 error.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Round ID to promote into
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User IDs to promote (individual events only)
 *                 example: ["user-uuid-1", "user-uuid-2"]
 *               teamIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Team IDs to promote (team events only)
 *                 example: [1, 2, 3]
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 description: Optional note attached to each selection
 *                 example: "Qualified from Round 1"
 *     responses:
 *       200:
 *         description: Promotion result
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
 *                     roundId:
 *                       type: integer
 *                     roundNumber:
 *                       type: integer
 *                     eventId:
 *                       type: string
 *                     eventName:
 *                       type: string
 *                     isTeamEvent:
 *                       type: boolean
 *                     promotedCount:
 *                       type: integer
 *                     promotedUserIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                     teamIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Only present for team events
 *       400:
 *         description: Validation error (wrong ID type, empty list, invalid IDs)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Round not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/rounds/:id/promote',
  validate({ params: roundIdParam, body: promoteBody }),
  promote
);

module.exports = router;
