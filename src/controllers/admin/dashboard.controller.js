const dashboardService = require('../../services/admin/dashboard.service');
const { success } = require('../../lib/response');

async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboardStats();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
