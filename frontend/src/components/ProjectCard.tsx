import React, { useState } from 'react';
import '../styles/ProjectCard.css';

interface Project {
    _id: string;
    title: string;
    description: string;
    wantCount: number;
    fundCount: number;
    name: string; // Ensure project name is included in the Project interface
}

interface ProjectCardProps {
    project: Project;
    onProjectUpdate?: (updatedProject: Project) => void;
    onProjectDelete?: (projectId: string) => void; // Add onProjectDelete prop
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onProjectUpdate, onProjectDelete }) => {
    const [isWantLoading, setIsWantLoading] = useState(false);
    const [isFundLoading, setIsFundLoading] = useState(false);
    const [localCounts, setLocalCounts] = useState({
        wantCount: project.wantCount,
        fundCount: project.fundCount
    });

    const handleWantClick = async () => {
        setIsWantLoading(true);
        try {
            const response = await fetch(`/api/projects/${project._id}/want`, {
                method: 'PATCH',
            });
            if (response.ok) {
                const updatedProject = await response.json();
                setLocalCounts(prev => ({
                    ...prev,
                    wantCount: updatedProject.wantCount
                }));
                onProjectUpdate?.(updatedProject);
            }
        } catch (error) {
            console.error('Error updating want count:', error);
        } finally {
            setIsWantLoading(false);
        }
    };

    const handleFundClick = async () => {
        setIsFundLoading(true);
        try {
            const response = await fetch(`/api/projects/${project._id}/fund`, {
                method: 'PATCH',
            });
            if (response.ok) {
                const updatedProject = await response.json();
                setLocalCounts(prev => ({
                    ...prev,
                    fundCount: updatedProject.fundCount
                }));
                onProjectUpdate?.(updatedProject);
            }
        } catch (error) {
            console.error('Error updating fund count:', error);
        } finally {
            setIsFundLoading(false);
        }
    };

    const handleEditClick = () => {
        // Implement edit functionality
        console.log('Edit project:', project._id);
    };

    const handleDeleteClick = async () => {
        try {
            const response = await fetch(`/api/projects/${project._id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                onProjectDelete?.(project._id);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    return (
        <div className="project-card">
            <h2 className="project-title">{project.title}</h2>
            <h3>{project.name}</h3> {/* Ensure project name is displayed */}
            <p className="project-description">{project.description}</p>
            <div className="project-actions">
                <button 
                    onClick={handleWantClick} 
                    className={`want-button ${isWantLoading ? 'loading' : ''}`}
                    disabled={isWantLoading}
                >
                    {isWantLoading ? 'Updating...' : `I want this (${localCounts.wantCount || 0})`}
                </button>
                <button 
                    onClick={handleFundClick} 
                    className={`fund-button ${isFundLoading ? 'loading' : ''}`}
                    disabled={isFundLoading}
                >
                    {isFundLoading ? 'Updating...' : `I'll fund this (${localCounts.fundCount || 0})`}
                </button>
                <button onClick={handleEditClick} className="edit-button">
                    Edit
                </button>
                <button onClick={handleDeleteClick} className="delete-button">
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
