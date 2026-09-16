const registrationService = require('../../services/admin/registration.service');
const { success } = require('../../lib/response');

async function getRegistrationsByEvent(req, res, next) {
  try {
    const { page, limit, ...rest } = req.query;
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const data = await registrationService.getRegistrationsByEvent(
      req.params.id,
      { ...rest, page: parsedPage, limit: parsedLimit }
    );
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function getRegistration(req, res, next) {
  try {
    const data = await registrationService.getRegistrationById(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRegistrationsByEvent, getRegistration };
