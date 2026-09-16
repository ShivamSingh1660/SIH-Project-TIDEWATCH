const resultService = require('../../services/admin/result.service');
const { success } = require('../../lib/response');

async function getResultsByEvent(req, res, next) {
  try {
    const data = await resultService.getResultsByEvent(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function promote(req, res, next) {
  try {
    const data = await resultService.promoteToRound(req.params.id, req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getResultsByEvent, promote };
