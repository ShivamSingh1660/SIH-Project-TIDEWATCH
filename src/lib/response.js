/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} statusCode
 */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {*} [details]
 */
function error(res, message, statusCode = 500, details = undefined) {
  const body = {
    success: false,
    error: { message },
  };
  if (details !== undefined) {
    body.error.details = details;
  }
  return res.status(statusCode).json(body);
}

module.exports = { success, error };
