// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import AdminHome from './Home';
// import EventManagement from './events/EventManagement';
// import EventDetails from './events/EventDetails';
// import CertificateManagement from './certificates/CertificateManagement';
// import LeaderboardManagement from './leaderboard/LeaderboardManagement';
// import AttendanceManager from './events/attendance/AttendanceManager';
// import LeaderboardManager from './events/leaderboard/LeaderboardManager';
// import CertificatesManager from './events/certificates/CertificateManager';
// import TeamAttendanceManager from './events/team/TeamAttendanceManager';
// import TeamLeaderboardManager from './events/team/TeamLeaderboardManager';
// import TeamCertificateManager from './events/team/TeamCertificateManager';
// import StudentManagement from './students/StudentManagement';
// import AdminProfile from './profile/AdminProfile';

// function AdminDashboard() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Routes>
//         <Route path="/" element={<AdminHome />} />
//         <Route path="/events" element={<EventManagement />} />
//         <Route path="/events/:id" element={<EventDetails />} />
//         <Route path="/certificates" element={<CertificateManagement />} />
//         <Route path="/leaderboard" element={<LeaderboardManagement />} />
//         <Route path="/students" element={<StudentManagement />} />
//         <Route path="/profile" element={<AdminProfile />} />
        
//         {/* Individual participant routes */}
//         <Route 
//           path="/events/:eventId/subevents/:subEventId/attendance" 
//           element={<AttendanceManager />} 
//         />
//         <Route 
//           path="/events/:eventId/subevents/:subEventId/leaderboard" 
//           element={<LeaderboardManager />} 
//         />
//         <Route 
//           path="/events/:eventId/subevents/:subEventId/certificates" 
//           element={<CertificatesManager />} 
//         />

//         {/* Team routes */}
//         <Route 
//           path="/events/:eventId/subevents/:subEventId/team-attendance" 
//           element={<TeamAttendanceManager />} 
//         />
//         <Route 
//           path="/events/:eventId/subevents/:subEventId/team-leaderboard" 
//           element={<TeamLeaderboardManager />} 
//         />
//         <Route 
//           path="/events/:eventId/subevents/:subEventId/team-certificates" 
//           element={<TeamCertificateManager />} 
//         />
//       </Routes>
//     </div>
//   );
// }

// export default AdminDashboard;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHome from './Home';
import EventManagement from './events/EventManagement';
import EventDetails from './events/EventDetails';
import CertificateManagement from './certificates/CertificateManagement';
import LeaderboardManagement from './leaderboard/LeaderboardManagement';
import AttendanceManager from './events/attendance/AttendanceManager';
import LeaderboardManager from './events/leaderboard/LeaderboardManager';
import CertificatesManager from './events/certificates/CertificateManager';
import TeamAttendanceManager from './events/team/TeamAttendanceManager';
import TeamLeaderboardManager from './events/team/TeamLeaderboardManager';
import TeamCertificateManager from './events/team/TeamCertificateManager';
import StudentManagement from './students/StudentManagement';
import AdminProfile from './profile/AdminProfile';
import ComplaintManagement from './complaints/ComplaintManagement';

function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/events" element={<EventManagement />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/certificates" element={<CertificateManagement />} />
        <Route path="/leaderboard" element={<LeaderboardManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/complaints" element={<ComplaintManagement />} />
        
        {/* Individual participant routes */}
        <Route 
          path="/events/:eventId/subevents/:subEventId/attendance" 
          element={<AttendanceManager />} 
        />
        <Route 
          path="/events/:eventId/subevents/:subEventId/leaderboard" 
          element={<LeaderboardManager />} 
        />
        <Route 
          path="/events/:eventId/subevents/:subEventId/certificates" 
          element={<CertificatesManager />} 
        />

        {/* Team routes */}
        <Route 
          path="/events/:eventId/subevents/:subEventId/team-attendance" 
          element={<TeamAttendanceManager />} 
        />
        <Route 
          path="/events/:eventId/subevents/:subEventId/team-leaderboard" 
          element={<TeamLeaderboardManager />} 
        />
        <Route 
          path="/events/:eventId/subevents/:subEventId/team-certificates" 
          element={<TeamCertificateManager />} 
        />
      </Routes>
    </div>
  );
}

export default AdminDashboard;