import React, { useState, useRef } from 'react';
import { Eye, X, MousePointer, Save } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import toast from 'react-hot-toast';

export default function CertificatePreview({ 
  template, 
  onClose, 
  onUpdatePositions, 
  type,
  isTeam = false 
}) {
  const [selectedField, setSelectedField] = useState(null);
  const [positions, setPositions] = useState(template.positions || {});
  const [previewMode, setPreviewMode] = useState(false);
  const imageRef = useRef(null);

  const fields = isTeam ? {
    teamName: 'Team Name',
    name: 'Student Name',
    event: 'Event Name',
    date: 'Date',
    certificateId: 'Certificate ID',
    ...(type === 'merit' && { rank: 'Rank' })
  } : {
    name: 'Student Name',
    event: 'Event Name',
    date: 'Date',
    certificateId: 'Certificate ID',
    ...(type === 'merit' && { rank: 'Rank' })
  };

  const handleImageClick = (e) => {
    if (!previewMode && selectedField) {
      const rect = imageRef.current.getBoundingClientRect();
      const scale = imageRef.current.naturalWidth / rect.width;
      
      const x = Math.round((e.clientX - rect.left) * scale);
      const y = Math.round((e.clientY - rect.top) * scale);
      
      setPositions(prev => ({
        ...prev,
        [selectedField]: { x, y }
      }));
    }
  };

  const handleSave = () => {
    const requiredFields = Object.keys(fields);
    const missingFields = requiredFields.filter(field => !positions[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please set positions for: ${missingFields.join(', ')}`);
      return;
    }

    onUpdatePositions(positions);
  };

  const getPreviewStyle = (pos) => {
    if (!pos) return {};
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return {};
    
    const scale = rect.width / imageRef.current.naturalWidth;
    return {
      left: pos.x * scale,
      top: pos.y * scale
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Certificate Preview - {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="btn btn-secondary"
            >
              {previewMode ? (
                <>
                  <MousePointer className="h-4 w-4 mr-2" />
                  Edit Positions
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Positions
            </button>
            <button onClick={onClose} className="btn btn-ghost">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={template.preview}
              alt="Certificate Template"
              className="max-w-full h-auto cursor-crosshair"
              onClick={handleImageClick}
            />

            {!previewMode && (
              <div className="absolute top-4 left-4 space-y-2 bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg backdrop-blur-sm">
                <p className="font-medium mb-2">Select field to position:</p>
                {Object.entries(fields).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedField(key)}
                    className={cn(
                      "btn btn-sm w-full",
                      selectedField === key ? 'btn-primary' : 'btn-ghost'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Field Position Markers */}
            {!previewMode && Object.entries(positions).map(([field, pos]) => (
              <div
                key={field}
                className="absolute w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={getPreviewStyle(pos)}
              >
                <span className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-primary text-white px-2 py-1 rounded">
                  {fields[field]}
                </span>
              </div>
            ))}

            {/* Preview Mode */}
            {previewMode && (
              <>
                {Object.entries(positions).map(([field, pos]) => {
                  const style = getPreviewStyle(pos);
                  let content = '';
                  let className = 'absolute transform -translate-x-1/2 -translate-y-1/2 ';

                  switch (field) {
                    case 'teamName':
                      content = 'Team Awesome';
                      className += 'text-xl font-bold text-gray-800';
                      break;
                    case 'name':
                      content = 'John Doe';
                      className += 'text-2xl font-bold text-gray-800';
                      break;
                    case 'event':
                      content = 'Web Development Workshop';
                      className += 'text-xl font-semibold text-gray-800';
                      break;
                    case 'date':
                      content = 'March 15, 2024';
                      className += 'text-lg text-gray-700';
                      break;
                    case 'certificateId':
                      content = 'TEAM-CC-123456';
                      className += 'text-sm text-gray-600';
                      break;
                    case 'rank':
                      content = '1st Place Team';
                      className += 'text-xl font-bold text-primary';
                      break;
                  }

                  return (
                    <div
                      key={field}
                      className={className}
                      style={style}
                    >
                      {content}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}