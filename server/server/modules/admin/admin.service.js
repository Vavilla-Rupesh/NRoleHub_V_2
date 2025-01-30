const PaymentDetails = require('../payments/payment.model');
const Student_Registrations = require('../events/studentRegistration.model');
const Event = require('../events/events.model');
const User = require('../auth/auth.model');
const Subevent = require('../events/subevents.model');
const Certificate = require('../certificates/certificate.model');
const { sequelize } = require('../../config/dataBase');
const Leaderboard = require('../leaderboard/leaderboard.model');
exports.createEvent = async (eventData) => {
  const transaction = await sequelize.transaction();
  try {
    const event = await Event.create(eventData, { transaction });
    await transaction.commit();
    return event;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || 'Failed to create event');
  }
};

exports.updateEvent = async (eventId, eventData) => {
  const transaction = await sequelize.transaction();
  try {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error('Event not found');
    
    await event.update(eventData, { transaction });
    await transaction.commit();
    return event;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || 'Failed to update event');
  }
};

exports.deleteEvent = async (eventId) => {
  const transaction = await sequelize.transaction();
  try {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error('Event not found');
    
    await event.destroy({ transaction });
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || 'Failed to delete event');
  }
};

exports.getEventRegistrations = async (eventId) => {
  try {
    const registrations = await Student_Registrations.findAll({
      where: { event_id: eventId },
      order: [['registration_date', 'DESC']],
      attributes: [
        'id', 
        'student_id', 
        'event_id', 
        'subevent_id', 
        'student_name', 
        'student_email',
        'payment_status',
        'attendance',
        'registration_date',
        'razorpay_payment_id'
      ]
    });

    if (!registrations) {
      throw new Error('No registrations found');
    }

    return registrations;
  } catch (error) {
    console.error('Get event registrations error:', error);
    throw new Error('Failed to fetch registrations');
  }
};

exports.getUserDetails = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['roll_number', 'year', 'semester', 'mobile_number']
    });
    return user;
  } catch (error) {
    console.error('Get user details error:', error);
    return null;
  }
};

exports.getSubeventDetails = async (subEventId) => {
  try {
    const subevent = await Subevent.findByPk(subEventId, {
      attributes: ['title']
    });
    return subevent;
  } catch (error) {
    console.error('Get subevent details error:', error);
    return null;
  }
};

exports.getCertificateDetails = async (userId, eventId, subEventId) => {
  try {
    const certificate = await Certificate.findOne({
      where: {
        user_id: userId,
        event_id: eventId,
        subevent_id: subEventId
      },
      attributes: ['certificate_id']
    });
    return certificate;
  } catch (error) {
    console.error('Get certificate details error:', error);
    return null;
  }
};

exports.markAttendance = async (registrationId, present = true) => {
  const transaction = await sequelize.transaction();
  try {
    const registration = await Student_Registrations.findByPk(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.payment_status !== 'paid') {
      throw new Error('Cannot mark attendance for unpaid registration');
    }

    await registration.update({ attendance: present }, { transaction });
    await transaction.commit();
    return registration;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || 'Failed to mark attendance');
  }
};

exports.markBulkAttendance = async (eventId, subEventId, present = false) => {
  const transaction = await sequelize.transaction();
  try {
    await Student_Registrations.update(
      { attendance: present },
      {
        where: {
          event_id: eventId,
          subevent_id: subEventId,
          payment_status: 'paid'
        },
        transaction
      }
    );

    await transaction.commit();
    
    return await Student_Registrations.findAll({
      where: {
        event_id: eventId,
        subevent_id: subEventId,
        payment_status: 'paid'
      }
    });
  } catch (error) {
    await transaction.rollback();
    throw new Error('Failed to update bulk attendance');
  }
};
exports.getAllStudentRegistrations = async () => {
  try {
    const registrations = await Student_Registrations.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'email', 'roll_number', 'year', 'semester', 'mobile_number', 'college_name', 'stream'],
          as: 'student'
        },
        {
          model: Event,
          attributes: ['event_name', 'nature_of_activity']
        },
        {
          model: Subevent,
          attributes: ['title']
        }
      ],
      order: [['registration_date', 'DESC']]
    });

    if (!registrations.length) {
      throw new Error('No registrations found');
    }

    const enrichedRegistrations = await Promise.all(registrations.map(async reg => {
      const leaderboardEntry = await Leaderboard.findOne({
        where: {
          student_id: reg.student_id,
          event_id: reg.event_id,
          subevent_id: reg.subevent_id
        },
        attributes: ['rank']
      });
      const certificate = await Certificate.findOne({
        where: {
          user_id: reg.student_id,
          event_id: reg.event_id,
          subevent_id: reg.subevent_id
        },
        attributes: ['certificate_id']
      });
      return {
        id: reg.id,
        name: reg.student?.username || reg.student_name || 'N/A',
        email: reg.student?.email || reg.student_email || 'N/A',
        roll_number: reg.student?.roll_number || 'N/A',
        mobile_number: reg.student?.mobile_number || 'N/A',
        year: reg.student?.year || 'N/A',
        semester: reg.student?.semester || 'N/A',
        college_name: reg.student?.college_name || 'N/A',
        stream: reg.student?.stream || 'N/A',
        event_name: reg.Event?.event_name || 'N/A',
        subevent_name: reg.Subevent?.title || 'N/A',
        nature_of_activity: reg.Event?.nature_of_activity || 'N/A',
        razorpay_payment_id: reg.razorpay_payment_id || 'N/A',
        certificate_id:certificate?.certificate_id||'N/A',
        attendance: reg.attendance || 'N/A',
        participation_type: leaderboardEntry?.rank ? 'Merit' : 'Participation',
        rank: leaderboardEntry?.rank || null,
        registration_date: reg.registration_date || 'N/A'
      };
    }));

    return enrichedRegistrations;
  } catch (error) {
    console.error('Get all student registrations error:', error);
    throw new Error('Failed to fetch student registrations');
  }
};
