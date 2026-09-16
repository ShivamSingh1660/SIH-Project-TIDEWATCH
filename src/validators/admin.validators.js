const Joi = require('joi');

// ─── Param schemas ──────────────────────────────────────────────

const eventIdParam = Joi.object({
  id: Joi.string().trim().required().label('Event ID'),
});

const registrationIdParam = Joi.object({
  id: Joi.number().integer().positive().required().label('Registration ID'),
});

const teamIdParam = Joi.object({
  id: Joi.number().integer().positive().required().label('Team ID'),
});

const roundIdParam = Joi.object({
  id: Joi.number().integer().positive().required().label('Round ID'),
});

const eventAndRoundParams = Joi.object({
  eventId: Joi.string().trim().required().label('Event ID'),
  roundId: Joi.number().integer().positive().required().label('Round ID'),
});

const eventIdOnlyParam = Joi.object({
  eventId: Joi.string().trim().required().label('Event ID'),
});

const resultsQuery = Joi.object({
  round_id: Joi.number().integer().positive().required().label('Round ID'),
});

// ─── Query schemas ──────────────────────────────────────────────

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().allow('').optional(),
  status: Joi.string().trim().allow('').optional(),
});

// ─── Body schemas ───────────────────────────────────────────────

const updateEventBody = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  club: Joi.string().trim().min(1).optional(),
  isTeamEvent: Joi.boolean().optional(),
  minTeamSize: Joi.number().integer().min(1).allow(null).optional(),
  maxTeamSize: Joi.number().integer().min(1).allow(null).optional(),
  price: Joi.number().integer().min(0).optional(),
  paymentTrigger: Joi.string()
    .valid('before_registration', 'after_round', 'free')
    .optional(),
  paymentRound: Joi.string().valid('ROUND_1', 'ROUND_2').optional(),
  registrationEndTime: Joi.date().iso().optional(),
  isPaid: Joi.boolean().optional(),
  paymentPageLink: Joi.string().uri().allow(null, '').optional(),
}).min(1).messages({
  'object.min': 'Request body must contain at least one field to update.',
});

const createRoundBody = Joi.object({
  roundNumber: Joi.number().integer().min(1).required(),
  name: Joi.string().trim().allow(null, '').optional(),
  roundEndTime: Joi.date().iso().required(),
});

const updateRoundBody = Joi.object({
  name: Joi.string().trim().allow(null, '').optional(),
  roundEndTime: Joi.date().iso().optional(),
}).min(1).messages({
  'object.min': 'Request body must contain at least one field to update.',
});

const promoteBody = Joi.object({
  // Only one of these will be used — determined by the event's isTeamEvent flag
  userIds: Joi.array().items(Joi.string().trim()).optional(),
  teamIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  notes: Joi.string().trim().allow(null, '').optional(),
});

module.exports = {
  eventIdParam,
  registrationIdParam,
  teamIdParam,
  roundIdParam,
  eventAndRoundParams,
  eventIdOnlyParam,
  resultsQuery,
  paginationQuery,
  updateEventBody,
  createRoundBody,
  updateRoundBody,
  promoteBody,
};
