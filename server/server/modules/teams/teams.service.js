const Team = require('./team.model');
const TeamMember = require('./team-member.model');
const TeamAttendance = require('./team-attendance.model');
const TeamLeaderboard = require('./team-leaderboard.model');
const TeamCertificate = require('./team-certificate.model');
const User = require('../auth/auth.model');
const StudentRegistration = require('../events/studentRegistration.model');
const Subevent = require('../events/subevents.model');
const Leaderboard = require('../leaderboard/leaderboard.model');
const { sequelize } = require('../../config/dataBase');
const { Op } = require('sequelize');

exports.createTeam = async (teamData) => {
  const transaction = await sequelize.transaction();
  try {
    // Create team
    const team = await Team.create(teamData, { transaction });

    // Add leader as first member with accepted status
    await TeamMember.create({
      team_id: team.id,
      student_id: teamData.leader_id,
      status: 'accepted'
    }, { transaction });

    await transaction.commit();
    return team;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.createJoinRequest = async (teamId, studentId) => {
  // Check if user already has a pending request
  const pendingRequest = await TeamMember.findOne({
    where: { 
      student_id: studentId,
      status: 'pending'
    }
  });

  if (pendingRequest) {
    throw new Error('You already have a pending request with another team');
  }

  // Check if user is already in a team for this event
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new Error('Team not found');
  }

  const existingTeamMember = await TeamMember.findOne({
    include: [{
      model: Team,
      where: {
        event_id: team.event_id,
        subevent_id: team.subevent_id
      }
    }],
    where: {
      student_id: studentId,
      status: 'accepted'
    }
  });

  if (existingTeamMember) {
    throw new Error('You are already a member of a team for this event');
  }

  // Create new join request
  return TeamMember.create({
    team_id: teamId,
    student_id: studentId,
    status: 'pending'
  });
};

exports.acceptJoinRequest = async (requestId) => {
  const transaction = await sequelize.transaction();
  try {
    // Find the request with team details
    const request = await TeamMember.findOne({
      where: { id: requestId },
      include: [{ 
        model: Team,
        attributes: ['id', 'event_id', 'subevent_id']
      }],
      transaction
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('This request is no longer pending');
    }

    // Get current team members count
    const currentMembersCount = await TeamMember.count({
      where: {
        team_id: request.team_id,
        status: 'accepted'
      },
      transaction
    });

    // Get team size limits from subevent
    const Subevent = require('../events/subevents.model');
    const subevent = await Subevent.findOne({
      where: { id: request.Team.subevent_id },
      attributes: ['max_team_size'],
      transaction
    });

    if (!subevent) {
      throw new Error('Subevent not found');
    }

    if (currentMembersCount >= subevent.max_team_size) {
      throw new Error('Team is already full');
    }

    // Check if user is already in another team for this event
    const existingTeamMember = await TeamMember.findOne({
      include: [{
        model: Team,
        where: {
          event_id: request.Team.event_id,
          subevent_id: request.Team.subevent_id,
          id: { [Op.ne]: request.team_id } // Exclude current team
        }
      }],
      where: {
        student_id: request.student_id,
        status: 'accepted'
      },
      transaction
    });

    if (existingTeamMember) {
      throw new Error('User is already a member of another team');
    }

    // Update request status to accepted
    await request.update({ status: 'accepted' }, { transaction });

    // Cancel other pending requests from this user for this event
    await TeamMember.update(
      { status: 'rejected' },
      {
        where: {
          student_id: request.student_id,
          status: 'pending',
          id: { [Op.ne]: requestId }
        },
        transaction
      }
    );

    await transaction.commit();
    return request;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.rejectJoinRequest = async (requestId) => {
  const transaction = await sequelize.transaction();
  try {
    const request = await TeamMember.findByPk(requestId, { transaction });
    if (!request) {
      throw new Error('Request not found');
    }
    
    if (request.status !== 'pending') {
      throw new Error('This request is no longer pending');
    }

    await request.update({ status: 'rejected' }, { transaction });
    await transaction.commit();
    return request;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.searchTeams = async (eventId, subEventId) => {
  return Team.findAll({
    where: {
      event_id: eventId,
      subevent_id: subEventId
    },
    include: [{
      model: TeamMember,
      where: { status: 'accepted' },
      include: [{
        model: User,
        as: 'student',
        attributes: ['username', 'email']
      }]
    }]
  });
};

exports.getTeamByMember = async (userId, eventId, subEventId) => {
  const team = await Team.findOne({
    where: {
      event_id: eventId,
      subevent_id: subEventId
    },
    include: [{
      model: TeamMember,
      where: { 
        student_id: userId,
        status: 'accepted'
      }
    }]
  });

  if (!team) return null;

  // Get all accepted members for this team
  const members = await TeamMember.findAll({
    where: {
      team_id: team.id,
      status: 'accepted'
    },
    include: [{
      model: User,
      as: 'student',
      attributes: ['username', 'email']
    }]
  });

  return {
    ...team.toJSON(),
    members: members.map(member => ({
      id: member.student_id,
      username: member.student.username,
      email: member.student.email,
      isLeader: member.student_id === team.leader_id
    }))
  };
};

exports.getPendingRequests = async (userId) => {
  // First find teams where user is leader
  const teams = await Team.findAll({
    where: { leader_id: userId }
  });

  if (!teams.length) return [];

  // Get pending requests for all teams led by user
  const requests = await TeamMember.findAll({
    where: {
      team_id: teams.map(team => team.id),
      status: 'pending'
    },
    include: [
      {
        model: Team,
        attributes: ['id', 'name', 'event_id', 'subevent_id']
      },
      {
        model: User,
        as: 'student',
        attributes: ['id', 'username', 'email']
      }
    ]
  });

  return requests.map(request => ({
    id: request.id,
    team_id: request.team_id,
    team_name: request.Team.name,
    student_id: request.student.id,
    student_name: request.student.username,
    student_email: request.student.email,
    status: request.status,
    event_id: request.Team.event_id,
    subevent_id: request.Team.subevent_id
  }));
};

exports.getTeamStatus = async (userId, eventId, subEventId) => {
  // Get all team memberships for this user in this event
  const memberships = await TeamMember.findAll({
    include: [{
      model: Team,
      where: {
        event_id: eventId,
        subevent_id: subEventId
      }
    }],
    where: {
      student_id: userId
    }
  });

  const status = {
    hasPendingRequest: false,
    rejectedTeams: [],
    currentTeamId: null
  };

  memberships.forEach(membership => {
    if (membership.status === 'pending') {
      status.hasPendingRequest = true;
    } else if (membership.status === 'rejected') {
      status.rejectedTeams.push(membership.team_id);
    } else if (membership.status === 'accepted') {
      status.currentTeamId = membership.team_id;
    }
  });

  return status;
};

exports.markTeamAttendance = async (teamId, present = false, adminId) => {
  const transaction = await sequelize.transaction();
  try {
    // Get team details with members and subevent info
    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: TeamMember,
          where: { status: 'accepted' },
          include: ['student']
        }
      ],
      transaction
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Get subevent details to check minimum team size
    const subevent = await Subevent.findByPk(team.subevent_id);
    if (!subevent) {
      throw new Error('Subevent not found');
    }

    // Check if team meets minimum size requirement
    if (team.TeamMembers.length < subevent.min_team_size) {
      throw new Error(`Team must have at least ${subevent.min_team_size} members to mark attendance`);
    }

    // Update or create attendance record
    const [attendance] = await TeamAttendance.upsert({
      team_id: teamId,
      event_id: team.event_id,
      subevent_id: team.subevent_id,
      attendance: present,
      marked_by: adminId,
      marked_at: new Date()
    }, { transaction });

    // Update individual student registrations
    await Promise.all(team.TeamMembers.map(member =>
      StudentRegistration.update(
        { attendance: present },
        {
          where: {
            student_id: member.student_id,
            event_id: team.event_id,
            subevent_id: team.subevent_id,
            payment_status: 'paid'
          },
          transaction
        }
      )
    ));

    await transaction.commit();
    return attendance;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getTeamAttendance = async (teamId) => {
  const attendance = await TeamAttendance.findOne({
    where: { team_id: teamId },
    include: [{
      model: Team,
      include: [{
        model: TeamMember,
        where: { status: 'accepted' },
        include: [{
          model: User,
          as: 'student',
          attributes: ['username', 'email']
        }]
      }]
    }]
  });
  return attendance;
};

exports.getTeamLeaderboard = async (eventId, subEventId) => {
  try {
    // Get only teams with attendance marked as present
    const teamsWithAttendance = await TeamAttendance.findAll({
      where: {
        event_id: eventId,
        subevent_id: subEventId,
        attendance: true
      },
      include: [{
        model: Team,
        include: [{
          model: TeamMember,
          where: { status: 'accepted' },
          include: [{
            model: User,
            as: 'student',
            attributes: ['username', 'email']
          }]
        }]
      }]
    });

    const teamIds = teamsWithAttendance.map(ta => ta.team_id);

    // Get leaderboard entries for these teams
    let leaderboard = await TeamLeaderboard.findAll({
      where: {
        team_id: { [Op.in]: teamIds },
        event_id: eventId,
        subevent_id: subEventId
      },
      include: [{
        model: Team,
        include: [{
          model: TeamMember,
          where: { status: 'accepted' },
          include: [{
            model: User,
            as: 'student',
            attributes: ['username', 'email']
          }]
        }]
      }],
      order: [['score', 'DESC']]
    });

    // If no leaderboard entries exist, create initial entries with score 0
    if (leaderboard.length === 0 && teamsWithAttendance.length > 0) {
      const initialEntries = await Promise.all(teamsWithAttendance.map(async (ta) => {
        return TeamLeaderboard.create({
          team_id: ta.team_id,
          event_id: eventId,
          subevent_id: subEventId,
          score: 0
        });
      }));

      // Fetch the newly created entries with team data
      leaderboard = await TeamLeaderboard.findAll({
        where: {
          id: { [Op.in]: initialEntries.map(entry => entry.id) }
        },
        include: [{
          model: Team,
          include: [{
            model: TeamMember,
            where: { status: 'accepted' },
            include: [{
              model: User,
              as: 'student',
              attributes: ['username', 'email']
            }]
          }]
        }],
        order: [['score', 'DESC']]
      });
    }

    return leaderboard;
  } catch (error) {
    console.error('Error fetching team leaderboard:', error);
    throw error;
  }
};

exports.editTeamWinners = async (eventId, subEventId, winners) => {
  const transaction = await sequelize.transaction();

  try {
    // Clear existing leaderboard entries for this event/subevent
    await TeamLeaderboard.destroy({
      where: {
        event_id: eventId,
        subevent_id: subEventId
      },
      transaction
    });

    // Create new entries with ranks and scores
    const leaderboardEntries = winners.map(winner => ({
      team_id: winner.team_id,
      event_id: eventId,
      subevent_id: subEventId,
      score: winner.score,
      rank: winner.position
    }));

    // Create team leaderboard entries
    const teamLeaderboardEntries = await TeamLeaderboard.bulkCreate(leaderboardEntries, { transaction });

    // For each team, get members and create individual leaderboard entries
    for (const entry of teamLeaderboardEntries) {
      // Get team members
      const teamMembers = await TeamMember.findAll({
        where: {
          team_id: entry.team_id,
          status: 'accepted'
        },
        transaction
      });

      // Delete existing individual leaderboard entries for these members
      await Leaderboard.destroy({
        where: {
          student_id: {
            [Op.in]: teamMembers.map(member => member.student_id)
          },
          event_id: eventId,
          subevent_id: subEventId
        },
        transaction
      });

      // Create new individual leaderboard entries for each team member
      const memberLeaderboardEntries = teamMembers.map(member => ({
        student_id: member.student_id,
        event_id: eventId,
        subevent_id: subEventId,
        score: entry.score,
        rank: entry.rank,
        created_at: new Date()
      }));

      await Leaderboard.bulkCreate(memberLeaderboardEntries, { transaction });
    }

    await transaction.commit();

    // Return updated leaderboard
    return await TeamLeaderboard.findAll({
      where: {
        event_id: eventId,
        subevent_id: subEventId
      },
      include: [{
        model: Team,
        include: [{
          model: TeamMember,
          where: { status: 'accepted' },
          include: [{
            model: User,
            as: 'student',
            attributes: ['username', 'email']
          }]
        }]
      }],
      order: [['score', 'DESC']]
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.generateTeamCertificates = async (teamId) => {
  const transaction = await sequelize.transaction();
  try {
    const team = await Team.findByPk(teamId, {
      include: [{
        model: TeamMember,
        where: { status: 'accepted' },
        include: [{
          model: User,
          as: 'student'
        }]
      }],
      transaction
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Get team's rank from leaderboard
    const leaderboard = await TeamLeaderboard.findOne({
      where: {
        team_id: teamId,
        event_id: team.event_id,
        subevent_id: team.subevent_id
      },
      transaction
    });

    // Generate certificates for each team member
    const certificates = await Promise.all(team.TeamMembers.map(async (member) => {
      const certificateId = `TEAM-${team.id}-${member.id}-${Date.now()}`;
      
      return TeamCertificate.create({
        team_id: teamId,
        member_id: member.id,
        event_id: team.event_id,
        subevent_id: team.subevent_id,
        certificate_url: `/certificates/team/${certificateId}.pdf`,
        certificate_id: certificateId,
        rank: leaderboard?.rank || null
      }, { transaction });
    }));

    await transaction.commit();
    return certificates;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getTeamCertificates = async (teamId) => {
  return await TeamCertificate.findAll({
    where: { team_id: teamId },
    include: [{
      model: TeamMember,
      include: [{
        model: User,
        as: 'student',
        attributes: ['username', 'email']
      }]
    }]
  });
};