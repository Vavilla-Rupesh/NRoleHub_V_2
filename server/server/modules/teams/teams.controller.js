const TeamsService = require('./teams.service');
const { sendNotificationMail } = require('../../utils/mailer');

exports.createTeam = async (req, res) => {
  try {
    const team = await TeamsService.createTeam({
      name: req.body.name,
      event_id: req.body.event_id,
      subevent_id: req.body.subevent_id,
      leader_id: req.user.id
    });
    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.requestToJoin = async (req, res) => {
  try {
    const request = await TeamsService.createJoinRequest(req.body.team_id, req.user.id);
    res.status(201).json({ message: 'Join request sent successfully', request });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const team = await TeamsService.acceptJoinRequest(req.params.requestId);
    res.status(200).json({ message: 'Request accepted successfully', team });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    await TeamsService.rejectJoinRequest(req.params.requestId);
    res.status(200).json({ message: 'Request rejected successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchTeams = async (req, res) => {
  try {
    const teams = await TeamsService.searchTeams(req.query.event_id, req.query.subevent_id,req.query.search);
    res.status(200).json(teams);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyTeam = async (req, res) => {
  try {
    const { eventId, subEventId } = req.params;
    const team = await TeamsService.getTeamByMember(
      req.user.id,
      parseInt(eventId),
      parseInt(subEventId)
    );
    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await TeamsService.getPendingRequests(req.user.id);
    res.status(200).json(requests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTeamStatus = async (req, res) => {
  try {
    const { eventId, subEventId } = req.params;
    const status = await TeamsService.getTeamStatus(
      req.user.id,
      parseInt(eventId),
      parseInt(subEventId)
    );
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markTeamAttendance = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { present = false } = req.body;
    
    const attendance = await TeamsService.markTeamAttendance(
      parseInt(teamId),
      present,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: `Team attendance marked as ${present ? 'present' : 'absent'}`,
      attendance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTeamAttendance = async (req, res) => {
  try {
    const { teamId } = req.params;
    const attendance = await TeamsService.getTeamAttendance(parseInt(teamId));
    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTeamScore = async (req, res) => {
  try {
    const { teamId, eventId, subEventId, score } = req.body;
    
    if (!teamId || !eventId || !subEventId || score === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const leaderboard = await TeamsService.updateTeamScore(
      parseInt(teamId),
      parseInt(eventId),
      parseInt(subEventId),
      parseInt(score)
    );

    res.status(200).json({
      success: true,
      message: 'Team score updated successfully',
      leaderboard
    });
  } catch (error) {
    console.error('Update team score error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update team score'
    });
  }
};

exports.getTeamLeaderboard = async (req, res) => {
  try {
    const { eventId, subEventId } = req.params;
    const leaderboard = await TeamsService.getTeamLeaderboard(
      parseInt(eventId),
      parseInt(subEventId)
    );
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.generateTeamCertificates = async (req, res) => {
  try {
    const { teamId } = req.params;
    const certificates = await TeamsService.generateTeamCertificates(parseInt(teamId));
    
    // Send email notifications to team members
    for (const cert of certificates) {
      try {
        await sendNotificationMail(
          cert.member.email,
          'Team Certificate Available',
          '',
          `<p>Your team certificate for ${cert.event_name} is now available!</p>`
        );
      } catch (emailError) {
        console.error('Failed to send certificate email:', emailError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Team certificates generated successfully',
      certificates
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTeamCertificates = async (req, res) => {
  try {
    const { teamId } = req.params;
    const certificates = await TeamsService.getTeamCertificates(parseInt(teamId));
    res.status(200).json(certificates);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.editTeamWinners = async (req, res) => {
  try {
    const { eventId, subEventId, winners } = req.body;

    if (!eventId || !subEventId || !Array.isArray(winners)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    const updatedLeaderboard = await TeamsService.editTeamWinners(
      parseInt(eventId),
      parseInt(subEventId),
      winners
    );

    res.status(200).json({
      success: true,
      message: 'Team winners updated successfully',
      leaderboard: updatedLeaderboard
    });
  } catch (error) {
    console.error('Edit team winners error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update team winners'
    });
  }
};