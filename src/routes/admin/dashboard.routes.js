const router = require('express').Router();
const { getDashboard } = require('../../controllers/admin/dashboard.controller');

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get admin dashboard statistics
 *     description: Returns aggregate counts (events, registrations, teams, users), recent registrations, and per-event stats.
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                     totals:
 *                       type: object
 *                       properties:
 *                         events:
 *                           type: integer
 *                         registrations:
 *                           type: integer
 *                         teams:
 *                           type: integer
 *                         users:
 *                           type: integer
 *                     recentRegistrations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     perEventStats:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getDashboard);

module.exports = router;
