const express = require('express');
const router = express.Router();

// Import Routes
const authRoutes = require('./api/routes/auth.route');
const eventsRoutes = require('./api/routes/events.route');
const studentRegistrationsRoutes = require('./api/routes/studentRegistrations.route');
const subeventsRoutes = require('./api/routes/subevent.route');
const complaintsRoutes = require('./api/routes/complaint.route');
const paymentDetailsRoutes = require('./api/routes/payments.route');
const leaderboardRoutes = require('./api/routes/leaderboard.route');
const notificationsRoutes = require('./api/routes/notification.route');
const adminRoutes = require('./api/routes/admin.route');
const certificateRoutes = require('./api/routes/certificates.route');
const mailRoutes = require('./api/routes/mail.route');
const teamsRoutes = require('./api/routes/teams.route'); // Add this line

// Route Definitions
router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/registrations', studentRegistrationsRoutes);
router.use('/subevents', subeventsRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/payments', paymentDetailsRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/certificates', certificateRoutes);
router.use('/mailRoutes', mailRoutes);
router.use('/teams', teamsRoutes); // Add this line

module.exports = router;