const resultService = require('../../services/admin/result.service');
const { success } = require('../../lib/response');

async function getResultsByEvent(req, res, next) {
  try {
    const data = await resultService.getResultsByEvent(
      req.params.eventId,
      parseInt(req.query.round_id, 10)
    );
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function promote(req, res, next) {
  try {
    const data = await resultService.promoteToRound(req.params.eventId, parseInt(req.params.roundId, 10), req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getResultsByEvent, promote };
