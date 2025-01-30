import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Award, Download, Upload, Eye, X } from 'lucide-react';
import { useTeamLeaderboard } from '../../../../lib/hooks/useTeamLeaderboard';
import CertificatePreview from './CertificatePreview';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../../../lib/utils';

export default function TeamCertificateManager() {
  const { eventId, subEventId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('participation');
  const [templates, setTemplates] = useState({
    participation: {
      file: null,
      preview: null,
      positions: null,
      dimensions: null
    },
    merit: {
      file: null,
      preview: null,
      positions: null,
      dimensions: null
    }
  });
  const [generating, setGenerating] = useState(false);
  const { leaderboard, eligibleTeams, loading } = useTeamLeaderboard(
    parseInt(eventId),
    parseInt(subEventId)
  );

  const handleTemplateUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setTemplates(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            file: file,
            preview: reader.result,
            dimensions: {
              width: img.naturalWidth,
              height: img.naturalHeight
            }
          }
        }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const template = templates[activeTemplate];
    if (!template.file || !template.positions || !template.dimensions) {
      toast.error('Please complete template setup first');
      return;
    }
// Get teams based on template type
const teams = activeTemplate === 'merit' 
? leaderboard.slice(0, 3) // Top 3 teams for merit certificates
: eligibleTeams.filter(team => !leaderboard.find(lb => lb.rank <= 3 && lb.team_id === team.id));

if (teams.length === 0) {
toast.error(`No teams found for ${activeTemplate} certificates`);
return;
}


    try {
      setGenerating(true);
      const formData = new FormData();
      formData.append('templateType', activeTemplate);
      formData.append('pdfFileInput', template.file);
      formData.append('event_id', eventId);
      formData.append('subevent_id', subEventId);
      
      // Add positions with original image coordinates
      Object.entries(template.positions).forEach(([key, value]) => {
        formData.append(`${key}X`, value.x);
        formData.append(`${key}Y`, value.y);
      });

      // Add team data including ALL team members
      formData.append('teams', JSON.stringify(teams.map(team => ({
        id: team.id || team.team_id,
        name: team.name || team.Team?.name,
        rank: team.rank,
        members: team.TeamMembers || team.Team?.TeamMembers || []
      }))));

      const response = await api.post('/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(`Team ${activeTemplate} certificates generated successfully`);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error('Failed to generate team certificates');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Certificates</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTemplate('participation')}
            className={cn(
              "btn",
              activeTemplate === 'participation' ? 'btn-primary' : 'btn-ghost'
            )}
          >
            Participation Certificates
          </button>
          <button
            onClick={() => setActiveTemplate('merit')}
            className={cn(
              "btn",
              activeTemplate === 'merit' ? 'btn-primary' : 'btn-ghost'
            )}
          >
            Merit Certificates
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Template Upload</h3>
            <p className="text-sm text-gray-600">
              Upload a template for {activeTemplate} certificates
            </p>
          </div>
          {templates[activeTemplate].file && (
            <button
              onClick={() => setShowPreview(true)}
              className="btn btn-secondary"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview & Position
            </button>
          )}
        </div>

        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">
              {templates[activeTemplate].file ? 
                templates[activeTemplate].file.name : 
                'Click to upload template'
              }
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={(e) => handleTemplateUpload(e, activeTemplate)}
            />
          </label>
        </div>
      </div>

      {showPreview && (
        <CertificatePreview
          template={templates[activeTemplate]}
          onClose={() => setShowPreview(false)}
          onUpdatePositions={(newPositions) => {
            setTemplates(prev => ({
              ...prev,
              [activeTemplate]: {
                ...prev[activeTemplate],
                positions: newPositions
              }
            }));
            setShowPreview(false);
          }}
          type={activeTemplate}
          isTeam={true}
        />
      )}

      <div className="glass-card">
        <h3 className="text-lg font-bold mb-4">Eligible Teams</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search teams..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {(activeTemplate === 'merit' ? 
            leaderboard.filter(team => team.rank <= 3) : 
            eligibleTeams.filter(team => !leaderboard.find(lb => lb.rank <= 3 && lb.team_id === team.id))
          )
            .filter(team => 
              team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.TeamMembers?.some(member => 
                member.student?.username?.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
            .map((team) => (
              <div key={team.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{team.Team?.name || team.name}</h4>
                    <div className="mt-2 space-y-1">
                      {(team.Team?.TeamMembers || team.TeamMembers)?.map((member) => (
                        <div key={member.id} className="text-sm text-gray-600">
                          {member.student?.username}
                          {member.student_id === (team.Team?.leader_id || team.leader_id) && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Leader
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeTemplate === 'merit' && team.rank && (
                    <div className="text-right">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        team.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                        team.rank === 2 ? "bg-gray-100 text-gray-800" :
                        "bg-amber-100 text-amber-800"
                      )}>
                        {team.rank}{team.rank === 1 ? 'st' : team.rank === 2 ? 'nd' : 'rd'} Place
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!templates[activeTemplate].file || !templates[activeTemplate].positions || generating}
        className="btn btn-primary w-full"
      >
        {generating ? 'Generating Certificates...' : 'Generate Certificates'}
      </button>
    </div>
  );
}