const eventService = require('../../services/admin/event.service');
const { success } = require('../../lib/response');

async function listEvents(req, res, next) {
  try {
    const data = await eventService.listEvents(req.query);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const data = await eventService.getEventById(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const data = await eventService.updateEvent(req.params.id, req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { listEvents, getEvent, updateEvent };
