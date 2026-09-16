const registrationService = require('../../services/admin/registration.service');
const { success } = require('../../lib/response');

async function getRegistrationsByEvent(req, res, next) {
  try {
    const data = await registrationService.getRegistrationsByEvent(
      req.params.id,
      req.query
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
