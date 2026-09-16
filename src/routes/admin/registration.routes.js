const router = require('express').Router();
const validate = require('../../lib/validate');
const {
  eventIdParam,
  registrationIdParam,
  paginationQuery,
} = require('../../validators/admin.validators');
const {
  getRegistrationsByEvent,
  getRegistration,
} = require('../../controllers/admin/registration.controller');

/**
 * @swagger
 * /api/admin/events/{id}/registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: List registrations for an event
 *     description: Returns a paginated list of registrations for a specific event, with optional status filter.
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registered, in_round, shortlisted, eliminated, confirmed, cancelled]
 *         description: Filter by registration status
 *     responses:
 *       200:
 *         description: Paginated registration list
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
 *                     registrations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Registration'
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
  '/events/:id/registrations',
  validate({ params: eventIdParam, query: paginationQuery }),
  getRegistrationsByEvent
);

/**
 * @swagger
 * /api/admin/registrations/{id}:
 *   get:
 *     tags: [Registrations]
 *     summary: Get registration details
 *     description: Returns a single registration with user, team, and event details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       404:
 *         description: Registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/registrations/:id',
  validate({ params: registrationIdParam }),
  getRegistration
);

module.exports = router;
