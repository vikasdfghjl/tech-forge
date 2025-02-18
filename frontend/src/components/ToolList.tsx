import React, { useEffect, useState } from 'react';
import { ToolItem } from './ToolItem';

interface Tool {
    _id: string;
    name: string;
    wantCount: number;
    fundCount: number;
}

interface ToolListProps {
    projectId: string;
}

export const ToolList: React.FC<ToolListProps> = ({ projectId }) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const fetchTools = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/projects/${projectId}/tools`);
            if (!response.ok) {
                throw new Error('Failed to fetch tools');
            }
            const data = await response.json();
            setTools(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch tools');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (toolName: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/tools/${toolName}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete tool');
            }
            await fetchTools();
            alert('Tool deleted successfully');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to delete tool');
        }
    };

    useEffect(() => {
        fetchTools();
    }, [projectId]);

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
    }

    if (tools.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>No tools found</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {tools.map((tool) => (
                <ToolItem
                    key={tool._id}
                    projectId={projectId}
                    tool={tool}
                    onDelete={handleDelete}
                    onUpdate={fetchTools}
                />
            ))}
        </div>
    );
};
