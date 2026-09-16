const router = require('express').Router();
const validate = require('../../lib/validate');
const {
  eventIdParam,
  paginationQuery,
  updateEventBody,
} = require('../../validators/admin.validators');
const {
  listEvents,
  getEvent,
  updateEvent,
} = require('../../controllers/admin/event.controller');

/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     tags: [Events]
 *     summary: List all events
 *     description: Returns a paginated list of events with registration/team/round counts.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by event name or club
 *     responses:
 *       200:
 *         description: Paginated event list
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validate({ query: paginationQuery }), listEvents);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get event details
 *     description: Returns a single event with fest info, rounds, and counts.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validate({ params: eventIdParam }), getEvent);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: Update event fields
 *     description: Partially update an event. At least one field must be provided.
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
 *             properties:
 *               name:
 *                 type: string
 *               club:
 *                 type: string
 *               isTeamEvent:
 *                 type: boolean
 *               minTeamSize:
 *                 type: integer
 *                 nullable: true
 *               maxTeamSize:
 *                 type: integer
 *                 nullable: true
 *               price:
 *                 type: integer
 *               paymentTrigger:
 *                 type: string
 *                 enum: [before_registration, after_round, free]
 *               paymentRound:
 *                 type: string
 *                 enum: [ROUND_1, ROUND_2]
 *               registrationEndTime:
 *                 type: string
 *                 format: date-time
 *               isPaid:
 *                 type: boolean
 *               paymentPageLink:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Updated event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
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
router.patch(
  '/:id',
  validate({ params: eventIdParam, body: updateEventBody }),
  updateEvent
);

module.exports = router;
