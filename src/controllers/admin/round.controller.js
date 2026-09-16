const roundService = require('../../services/admin/round.service');
const { success } = require('../../lib/response');

async function getRoundsByEvent(req, res, next) {
  try {
    const data = await roundService.getRoundsByEvent(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function createRound(req, res, next) {
  try {
    const data = await roundService.createRound(req.params.id, req.body);
    return success(res, data, 201);
  } catch (err) {
    next(err);
  }
}

async function updateRound(req, res, next) {
  try {
    const data = await roundService.updateRound(req.params.id, req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRoundsByEvent, createRound, updateRound };
