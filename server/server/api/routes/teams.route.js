const express = require('express');
const router = express.Router();
const TeamsController = require('../../modules/teams/teams.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Team Management
router.post('/create', AuthMiddleware.authenticate, TeamsController.createTeam);
router.post('/join-request', AuthMiddleware.authenticate, TeamsController.requestToJoin);
router.put('/accept-request/:requestId', AuthMiddleware.authenticate, TeamsController.acceptRequest);
router.put('/reject-request/:requestId', AuthMiddleware.authenticate, TeamsController.rejectRequest);
router.get('/search', AuthMiddleware.authenticate, TeamsController.searchTeams);
router.get('/my-team/:eventId/:subEventId', AuthMiddleware.authenticate, TeamsController.getMyTeam);
router.get('/requests', AuthMiddleware.authenticate, TeamsController.getPendingRequests);
router.get('/status/:eventId/:subEventId', AuthMiddleware.authenticate, TeamsController.getTeamStatus);

// Team Attendance
router.put('/:teamId/attendance', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.authorize(['admin']), 
    TeamsController.markTeamAttendance
);
router.get('/:teamId/attendance', 
    AuthMiddleware.authenticate, 
    TeamsController.getTeamAttendance
);

// Team Leaderboard
router.post('/leaderboard', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.authorize(['admin']), 
    TeamsController.updateTeamScore
);

router.put('/leaderboard/winners',
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize(['admin']),
    TeamsController.editTeamWinners
);

router.get('/leaderboard/:eventId/:subEventId', 
    AuthMiddleware.authenticate, 
    TeamsController.getTeamLeaderboard
);

// Team Certificates
router.post('/:teamId/certificates', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.authorize(['admin']), 
    TeamsController.generateTeamCertificates
);
router.get('/:teamId/certificates', 
    AuthMiddleware.authenticate, 
    TeamsController.getTeamCertificates
);

module.exports = router;