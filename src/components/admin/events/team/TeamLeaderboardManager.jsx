// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Search, Trophy, Award, Edit2, Save, X } from 'lucide-react';
// import { useTeamLeaderboard } from '../../../../lib/hooks/useTeamLeaderboard';
// import LoadingSpinner from '../../../shared/LoadingSpinner';
// import EmptyState from '../../../shared/EmptyState';
// import { cn } from '../../../../lib/utils';
// import toast from 'react-hot-toast';

// export default function TeamLeaderboardManager() {
//   const { eventId, subEventId } = useParams();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editMode, setEditMode] = useState(false);
//   const [selectedWinners, setSelectedWinners] = useState([
//     { position: 1, team_id: '', score: '', name: '' },
//     { position: 2, team_id: '', score: '', name: '' },
//     { position: 3, team_id: '', score: '', name: '' }
//   ]);
//   const { 
//     leaderboard, 
//     eligibleTeams,
//     loading, 
//     editWinners,
//     refreshLeaderboard 
//   } = useTeamLeaderboard(parseInt(eventId), parseInt(subEventId));

//   const handleSaveWinners = async () => {
//     // Validate all winners have team_id and score
//     const invalidSelections = selectedWinners.filter(w => !w.team_id || !w.score);
//     if (invalidSelections.length > 0) {
//       toast.error('Please select teams and assign scores for all positions');
//       return;
//     }

//     try {
//       await editWinners(selectedWinners);
//       toast.success('Winners updated successfully');
//       setEditMode(false);
//       refreshLeaderboard();
//     } catch (error) {
//       toast.error('Failed to update winners');
//     }
//   };

//   const filteredTeams = eligibleTeams.filter(team => 
//     team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     team.TeamMembers?.some(member => 
//       member.student?.username?.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   if (loading) return <LoadingSpinner />;

//   if (!eligibleTeams?.length) {
//     return (
//       <EmptyState
//         icon={Trophy}
//         title="No Teams Found"
//         message="There are no teams with attendance marked as present"
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Team Leaderboard</h1>
//         <div className="flex items-center space-x-4">
//           <div className="relative w-64">
//             <input
//               type="text"
//               placeholder="Search teams..."
//               className="input pl-10 w-full"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>
//           {!editMode ? (
//             <button
//               onClick={() => setEditMode(true)}
//               className="btn btn-primary"
//             >
//               <Edit2 className="h-4 w-4 mr-2" />
//               {leaderboard.length > 0 ? 'Edit Winners' : 'Declare Winners'}
//             </button>
//           ) : (
//             <div className="flex space-x-2">
//               <button
//                 onClick={handleSaveWinners}
//                 className="btn btn-primary"
//               >
//                 <Save className="h-4 w-4 mr-2" />
//                 Save Changes
//               </button>
//               <button
//                 onClick={() => setEditMode(false)}
//                 className="btn btn-ghost"
//               >
//                 <X className="h-4 w-4 mr-2" />
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {editMode ? (
//         <div className="glass-card space-y-6">
//           <h2 className="text-xl font-bold mb-4">Select Winners</h2>
//           <div className="space-y-6">
//             {selectedWinners.map((winner) => (
//               <div key={winner.position} className="flex items-center space-x-4">
//                 <div className="w-24">
//                   <Trophy className={cn(
//                     "h-6 w-6",
//                     winner.position === 1 ? "text-yellow-500" :
//                     winner.position === 2 ? "text-gray-400" :
//                     "text-amber-600"
//                   )} />
//                 </div>
//                 <div className="flex-1">
//                   <select
//                     className="input w-full"
//                     value={winner.team_id}
//                     onChange={(e) => {
//                       const team = filteredTeams.find(t => t.id === parseInt(e.target.value));
//                       if (team) {
//                         setSelectedWinners(prev => prev.map(w => 
//                           w.position === winner.position ? {
//                             ...w,
//                             team_id: team.id,
//                             name: team.name
//                           } : w
//                         ));
//                       }
//                     }}
//                   >
//                     <option value="">Select team</option>
//                     {filteredTeams.map((team) => (
//                       <option key={team.id} value={team.id}>
//                         {team.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="w-32">
//                   <input
//                     type="number"
//                     placeholder="Score"
//                     className="input w-full"
//                     value={winner.score}
//                     onChange={(e) => {
//                       const score = parseInt(e.target.value);
//                       if (!isNaN(score) && score >= 0) {
//                         setSelectedWinners(prev => prev.map(w =>
//                           w.position === winner.position ? {
//                             ...w,
//                             score
//                           } : w
//                         ));
//                       }
//                     }}
//                     min="0"
//                     max="100"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="grid gap-6">
//           {leaderboard.map((entry, index) => (
//             <div key={entry.team_id} className="glass-card">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <div className="flex items-center space-x-3">
//                     <Award className={cn(
//                       "h-6 w-6",
//                       entry.rank === 1 ? "text-yellow-500" :
//                       entry.rank === 2 ? "text-gray-400" :
//                       entry.rank === 3 ? "text-amber-600" :
//                       "text-gray-300"
//                     )} />
//                     <h3 className="text-xl font-bold">{entry.Team?.name}</h3>
//                     {entry.rank && (
//                       <span className={cn(
//                         "px-2 py-1 text-xs rounded-full",
//                         entry.rank === 1 ? "bg-yellow-100 text-yellow-800" :
//                         entry.rank === 2 ? "bg-gray-100 text-gray-800" :
//                         "bg-amber-100 text-amber-800"
//                       )}>
//                         {entry.rank}{entry.rank === 1 ? 'st' : entry.rank === 2 ? 'nd' : 'rd'} Place
//                       </span>
//                     )}
//                   </div>
//                   <div className="mt-2 space-y-1">
//                     {entry.Team?.TeamMembers?.map((member) => (
//                       <div key={member.id} className="text-sm text-gray-600 dark:text-gray-400">
//                         {member.student?.username}
//                         {member.student_id === entry.Team?.leader_id && (
//                           <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
//                             Leader
//                           </span>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="text-2xl font-bold text-primary">
//                   {entry.score} points
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Trophy, Award, Edit2, Save, X } from 'lucide-react';
import { useTeamLeaderboard } from '../../../../lib/hooks/useTeamLeaderboard';
import LoadingSpinner from '../../../shared/LoadingSpinner';
import EmptyState from '../../../shared/EmptyState';
import { cn } from '../../../../lib/utils';
import toast from 'react-hot-toast';

export default function TeamLeaderboardManager() {
  const { eventId, subEventId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState([
    { position: 1, team_id: '', score: '', name: '' },
    { position: 2, team_id: '', score: '', name: '' },
    { position: 3, team_id: '', score: '', name: '' }
  ]);
  const { 
    leaderboard, 
    eligibleTeams,
    loading, 
    editWinners,
    refreshLeaderboard 
  } = useTeamLeaderboard(parseInt(eventId), parseInt(subEventId));

  const handleSaveWinners = async () => {
    const invalidSelections = selectedWinners.filter(w => !w.team_id || !w.score);
    if (invalidSelections.length > 0) {
      toast.error('Please select teams and assign scores for all positions');
      return;
    }

    try {
      await editWinners(selectedWinners);
      toast.success('Winners updated successfully');
      setEditMode(false);
      refreshLeaderboard();
    } catch (error) {
      toast.error('Failed to update winners');
    }
  };

  const filteredTeams = eligibleTeams.filter(team => 
    team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.TeamMembers?.some(member => 
      member.student?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return <LoadingSpinner />;

  if (!eligibleTeams?.length) {
    return (
      <EmptyState
        icon={Trophy}
        title="No Teams Found"
        message="There are no teams with attendance marked as present"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Team Leaderboard</h1>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search teams..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="btn btn-primary sm:w-auto w-full"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {leaderboard.length > 0 ? 'Edit Winners' : 'Declare Winners'}
            </button>
          ) : (
            <div className="flex space-x-2 sm:w-auto w-full">
              <button
                onClick={handleSaveWinners}
                className="btn btn-primary w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="btn btn-ghost w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {editMode ? (
        <div className="glass-card space-y-6">
          <h2 className="text-xl font-bold mb-4">Select Winners</h2>
          <div className="space-y-6">
            {selectedWinners.map((winner) => (
              <div key={winner.position} className="flex flex-col sm:flex-row items-center space-x-4">
                <div className="w-24">
                  <Trophy className={cn(
                    "h-6 w-6",
                    winner.position === 1 ? "text-yellow-500" :
                    winner.position === 2 ? "text-gray-400" :
                    "text-amber-600"
                  )} />
                </div>
                <div className="flex-1">
                  <select
                    className="input w-full"
                    value={winner.team_id}
                    onChange={(e) => {
                      const team = filteredTeams.find(t => t.id === parseInt(e.target.value));
                      if (team) {
                        setSelectedWinners(prev => prev.map(w => 
                          w.position === winner.position ? {
                            ...w,
                            team_id: team.id,
                            name: team.name
                          } : w
                        ));
                      }
                    }}
                  >
                    <option value="">Select team</option>
                    {filteredTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32 mt-4 sm:mt-0">
                  <input
                    type="number"
                    placeholder="Score"
                    className="input w-full"
                    value={winner.score}
                    onChange={(e) => {
                      const score = parseInt(e.target.value);
                      if (!isNaN(score) && score >= 0) {
                        setSelectedWinners(prev => prev.map(w =>
                          w.position === winner.position ? {
                            ...w,
                            score
                          } : w
                        ));
                      }
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leaderboard.map((entry, index) => (
            <div key={entry.team_id} className="glass-card">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <Award className={cn(
                      "h-6 w-6",
                      entry.rank === 1 ? "text-yellow-500" :
                      entry.rank === 2 ? "text-gray-400" :
                      entry.rank === 3 ? "text-amber-600" :
                      "text-gray-300"
                    )} />
                    <h3 className="text-xl font-bold">{entry.Team?.name}</h3>
                    {entry.rank && (
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        entry.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                        entry.rank === 2 ? "bg-gray-100 text-gray-800" :
                        "bg-amber-100 text-amber-800"
                      )}>
                        {entry.rank}{entry.rank === 1 ? 'st' : entry.rank === 2 ? 'nd' : 'rd'} Place
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {entry.Team?.TeamMembers?.map((member) => (
                      <div key={member.id} className="text-sm text-gray-600 dark:text-gray-400">
                        {member.student?.username}
                        {member.student_id === entry.Team?.leader_id && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Leader
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary mt-4 sm:mt-0">
                  {entry.score} points
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
