const router = require('express').Router();
const validate = require('../../lib/validate');
const {
  eventIdParam,
  roundIdParam,
  eventAndRoundParams,
  createRoundBody,
  updateRoundBody,
} = require('../../validators/admin.validators');
const {
  getRoundsByEvent,
  createRound,
  updateRound,
} = require('../../controllers/admin/round.controller');

/**
 * @swagger
 * /api/admin/events/{id}/rounds:
 *   get:
 *     tags: [Rounds]
 *     summary: List rounds for an event
 *     description: Returns all rounds for an event, ordered by round number. Supports unlimited rounds (Round 1 → 2 → 3 → ... → Final).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of event rounds
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
 *                     rounds:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EventRound'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/events/:id/rounds',
  validate({ params: eventIdParam }),
  getRoundsByEvent
);

/**
 * @swagger
 * /api/admin/events/{id}/rounds:
 *   post:
 *     tags: [Rounds]
 *     summary: Create a new round for an event
 *     description: Adds a new round. Round numbers must be unique per event and can go up to any number (N-round support).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roundNumber, roundEndTime]
 *             properties:
 *               roundNumber:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: "Semi-Finals"
 *                 nullable: true
 *               roundEndTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-15T18:00:00Z"
 *     responses:
 *       201:
 *         description: Created round
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EventRound'
 *       400:
 *         description: Validation error or duplicate round number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/events/:id/rounds',
  validate({ params: eventIdParam, body: createRoundBody }),
  createRound
);

/**
 * @swagger
 * /api/admin/events/{eventId}/rounds/{roundId}:
 *   patch:
 *     tags: [Rounds]
 *     summary: Update a round
 *     description: Partially update a round's name or end time.
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: roundId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Round ID belonging to that event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 nullable: true
 *               roundEndTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated round
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EventRound'
 *       400:
 *         description: Validation error
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
router.patch(
  '/events/:eventId/rounds/:roundId',
  validate({ params: eventAndRoundParams, body: updateRoundBody }),
  updateRound
);

module.exports = router;
