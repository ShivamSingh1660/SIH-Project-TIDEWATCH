const teamService = require('../../services/admin/team.service');
const { success } = require('../../lib/response');

async function getTeamsByEvent(req, res, next) {
  try {
    const data = await teamService.getTeamsByEvent(req.params.id, req.query);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function getTeam(req, res, next) {
  try {
    const data = await teamService.getTeamById(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getTeamsByEvent, getTeam };
