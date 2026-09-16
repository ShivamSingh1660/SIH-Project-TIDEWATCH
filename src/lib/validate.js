const { error: sendError } = require('./response');

/**
 * Create Express validation middleware from a Joi schema map.
 * @param {{ body?: import('joi').Schema, params?: import('joi').Schema, query?: import('joi').Schema }} schemas
 * @returns {import('express').RequestHandler}
 */
function validate(schemas) {
  return (req, res, next) => {
    for (const [source, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        const details = error.details.map((d) => d.message);
        return sendError(res, 'Validation failed', 400, details);
      }
      // Replace with validated + stripped values
      req[source] = value;
    }
    next();
  };
}

module.exports = validate;
