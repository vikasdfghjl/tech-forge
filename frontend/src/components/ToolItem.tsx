import React, { useState } from "react";

interface ToolItemProps {
  projectId: string;
  tool: {
    _id: string;
    name: string;
    wantCount: number;
    fundCount: number;
  };
  onDelete: (toolName: string) => void;
  onUpdate: () => void;
}

export const ToolItem: React.FC<ToolItemProps> = ({
  projectId,
  tool,
  onDelete,
  onUpdate,
}) => {
  const [isWantLoading, setIsWantLoading] = useState(false);
  const [isFundLoading, setIsFundLoading] = useState(false);

  const handleWantClick = async () => {
    try {
      setIsWantLoading(true);
      const response = await fetch(`/api/tools/${tool._id}/want`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to increment want count");
      }

      onUpdate();
      alert("Want count incremented");
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsWantLoading(false);
    }
  };

  const handleFundClick = async () => {
    try {
      setIsFundLoading(true);
      const response = await fetch(`/api/tools/${tool._id}/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to increment fund count");
      }

      onUpdate();
      alert("Fund count incremented");
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsFundLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
    }}>
      <span style={{ fontSize: '16px' }}>{tool.name}</span>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isWantLoading ? '#90CAF9' : '#2196F3',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
          }}
          onClick={handleWantClick}
          disabled={isWantLoading}
        >
          ⭐ Want ({tool.wantCount})
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isFundLoading ? '#A5D6A7' : '#4CAF50',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
          }}
          onClick={handleFundClick}
          disabled={isFundLoading}
        >
          + Fund ({tool.fundCount})
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#F44336',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
          }}
          onClick={() => onDelete(tool.name)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
