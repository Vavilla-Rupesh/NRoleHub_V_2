const TeamCertificate = require('./team-certificate.model');
const Team = require('./team.model');
const TeamMember = require('./team-member.model');
const TeamLeaderboard = require('./team-leaderboard.model');
const Event = require('../events/events.model');
const Subevent = require('../events/subevents.model');
const User = require('../auth/auth.model');
const overlayTextOnImage = require('../../utils/overlay');
const { sendEmailWithAttachment } = require('../../utils/mailer');
const fs = require('fs').promises;
const path = require('path');
const { sequelize } = require('../../config/dataBase');

function generateCertificateId(team, member, event, subevent, rank = null) {
  const timestamp = Date.now().toString(36);
  const eventPrefix = event.event_name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 3)
    .toUpperCase();
  const subEventPrefix = subevent.title
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 3)
    .toUpperCase();
  const teamId = team.id.toString().padStart(4, '0');
  const rankSuffix = rank ? `-R${rank}` : '';
  
  return `TEAM-${eventPrefix}-${subEventPrefix}-${teamId}${rankSuffix}-${timestamp}`;
}

function generateFileName(certificateId, teamName, memberName) {
  const sanitizedTeam = teamName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const sanitizedMember = memberName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${certificateId}_${sanitizedTeam}_${sanitizedMember}.jpg`;
}

function getRankSuffix(rank) {
  if (rank >= 11 && rank <= 13) return 'th';
  const lastDigit = rank % 10;
  switch (lastDigit) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

exports.generateTeamCertificates = async (inputs) => {
  const event_id = parseInt(inputs.body.event_id);
  const subevent_id = parseInt(inputs.body.subevent_id);
  const templateType = inputs.body.templateType || 'participation';
  let transaction;

  try {
    if (!inputs.files || !inputs.files.pdfFileInput) {
      throw new Error('Missing template image');
    }

    const coordinates = {
      teamName: {
        x: parseInt(inputs.body.teamNameX),
        y: parseInt(inputs.body.teamNameY)
      },
      name: {
        x: parseInt(inputs.body.nameX),
        y: parseInt(inputs.body.nameY)
      },
      event: {
        x: parseInt(inputs.body.eventX),
        y: parseInt(inputs.body.eventY)
      },
      date: {
        x: parseInt(inputs.body.dateX),
        y: parseInt(inputs.body.dateY)
      },
      certificateId: {
        x: parseInt(inputs.body.certificateIdX),
        y: parseInt(inputs.body.certificateIdY)
      },
      rollNumber: {
        x: parseInt(inputs.body.rollNumberX),
        y: parseInt(inputs.body.rollNumberY)
      },
      year: {
        x: parseInt(inputs.body.yearX),
        y: parseInt(inputs.body.yearY)
      },
      sem: {
        x: parseInt(inputs.body.semX),
        y: parseInt(inputs.body.semY)
      },
      stream: {
        x: parseInt(inputs.body.streamX),
        y: parseInt(inputs.body.streamY)
      },
      college: {
        x: parseInt(inputs.body.collegeX),
        y: parseInt(inputs.body.collegeY)
      },
      
      rank: inputs.body.rankX && inputs.body.rankY ? {
        x: parseInt(inputs.body.rankX),
        y: parseInt(inputs.body.rankY)
      } : null
    };

    const templateImageBuffer = await fs.readFile(inputs.files.pdfFileInput[0].path);
    transaction = await sequelize.transaction();

    const event = await Event.findByPk(event_id);
    const subevent = await Subevent.findByPk(subevent_id);
    
    if (!event || !subevent) {
      throw new Error('Event or subevent not found');
    }

    let teams = [];
    if (templateType === 'merit') {
      // Get all teams in leaderboard order without limit
      const leaderboard = await TeamLeaderboard.findAll({
        where: { event_id, subevent_id },
        order: [['rank', 'ASC']],
        include: [{
          model: Team,
          include: [{
            model: TeamMember,
            where: { status: 'accepted' },
            include: [{
              model: User,
              as: 'student'
            }]
          }]
        }]
      });

      teams = leaderboard.map(entry => ({
        ...entry.Team.toJSON(),
        name: entry.Team.name, // Explicitly include team name
        rank: entry.rank,
        score: entry.score
      }));

      console.log('Merit Teams:', teams); // Debug log
    } else {
      // Get teams with attendance marked
      const teamsWithAttendance = await Team.findAll({
        where: { event_id, subevent_id },
        include: [{
          model: TeamMember,
          where: { status: 'accepted' },
          include: [{
            model: User,
            as: 'student'
          }]
        }]
      });

      // Exclude teams that are in leaderboard
      const leaderboardTeams = await TeamLeaderboard.findAll({
        where: { event_id, subevent_id }
      });
      const leaderboardTeamIds = leaderboardTeams.map(t => t.team_id);

      teams = teamsWithAttendance.filter(team => !leaderboardTeamIds.includes(team.id));
      console.log('Participation Teams:', teams); // Debug log
    }

    if (!teams.length) {
      throw new Error(`No eligible teams found for ${templateType} certificates`);
    }

    const baseDir = path.join(process.cwd(), 'Records', 'Teams');
    await fs.mkdir(baseDir, { recursive: true });

    // Generate certificates for each team member
    for (const team of teams) {
      if (!team.TeamMembers?.length) {
        console.warn(`Team ${team.id} has no members, skipping`);
        continue;
      }

      const eventName = event.event_name;
      const certificateDate = new Date().toLocaleDateString();
      const outputDir = path.join(baseDir, eventName.replace(/[^a-zA-Z0-9]/g, '_'));
      await fs.mkdir(outputDir, { recursive: true });

      for (const member of team.TeamMembers) {
        if (!member.student) {
          console.warn(`Member ${member.id} has no student data, skipping`);
          continue;
        }

        const certificateId = generateCertificateId(team, member, event, subevent, team.rank);
        const fileName = generateFileName(certificateId, team.name, member.student.username);
        const outputPath = path.join(outputDir, fileName);

        const certificateBuffer = await overlayTextOnImage(
          templateImageBuffer,
          member.student.username,
          eventName,
          certificateDate,
          coordinates,
          certificateId,
          team.rank ? `${team.rank}${getRankSuffix(team.rank)} Place Team` : null,
          team.name,
          {
            rollNumber: member.student.roll_number,
            year: member.student.year,
            semester: member.student.semester,
            collegeName: member.student.college_name,
            stream:mem.stream
          }
        );

        await fs.writeFile(outputPath, certificateBuffer);

        // Create certificate record
        await TeamCertificate.create({
          team_id: team.id,
          member_id: member.id,
          event_id,
          subevent_id,
          certificate_url: outputPath,
          certificate_id: certificateId,
          rank: team.rank || null,
          issued_at: new Date()
        }, { transaction });

        // Send email to team member
        await sendEmailWithAttachment(
          member.student.email,
          outputPath,
          member.student.username,
          eventName,
          team.rank ? true : false
        );
      }
    }

    await transaction.commit();
    return { success: true, message: 'Team certificates generated successfully' };
  } catch (err) {
    console.error('Team certificate generation error:', err);
    if (transaction) {
      await transaction.rollback();
    }
    throw err;
  }
};