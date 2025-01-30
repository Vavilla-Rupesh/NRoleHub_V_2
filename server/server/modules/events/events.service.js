const Event = require('./events.model');
const StudentRegistration = require('./studentRegistration.model');
const { sequelize } = require('../../config/dataBase');

exports.getAllEvents = async (page, limit, userId = null, role = null) => {
  const offset = (page - 1) * limit;
  
  // No more filtering by created_by for admins
  // All admins can see all events
  return Event.findAndCountAll({ 
    offset, 
    limit,
    order: [['created_at', 'DESC']]
  });
};

exports.getEventById = async (eventId, userId = null, role = null) => {
  const whereClause = {
    id: eventId
  };
  
  // No more filtering by created_by for admins
  // All admins can access any event
  const event = await Event.findOne({ where: whereClause });
  if (!event) {
    throw new Error('Event not found');
  }
  
  return event;
};

exports.getParticipantsCount = async (eventId, subEventId = null) => {
  const where = {
    event_id: eventId,
    payment_status: 'paid'
  };
  
  if (subEventId) {
    where.subevent_id = subEventId;
  }
  
  return StudentRegistration.count({ where });
};