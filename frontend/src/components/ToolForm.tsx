import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ToolForm.css';

interface Tool {
    _id: string;
    name: string;
    wantCount: number;
    fundCount: number;
}

const ToolForm = () => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [toolName, setToolName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loadingStates, setLoadingStates] = useState<{[key: string]: {want: boolean, fund: boolean}}>({});

    const fetchTools = async () => {
        const response = await axios.get('http://localhost:5000/api/tools');
        setTools(response.data);
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await axios.put(`http://localhost:5000/api/tools/${editingId}`, { name: toolName });
        } else {
            await axios.post('http://localhost:5000/api/tools', { name: toolName });
        }
        setToolName('');
        setEditingId(null);
        fetchTools();
    };

    const handleDelete = async (id: string) => {
        await axios.delete(`http://localhost:5000/api/tools/${id}`);
        fetchTools();
    };

    const handleEdit = (tool: Tool) => {
        setToolName(tool.name);
        setEditingId(tool._id);
    };

    const handleWantClick = async (toolId: string) => {
        try {
            setLoadingStates(prev => ({
                ...prev,
                [toolId]: { ...prev[toolId], want: true }
            }));
            await axios.post(`http://localhost:5000/api/tools/${toolId}/want`);
            await fetchTools();
        } catch (error) {
            console.error('Want error:', error);
            alert('Failed to update want count');
        } finally {
            setLoadingStates(prev => ({
                ...prev,
                [toolId]: { ...prev[toolId], want: false }
            }));
        }
    };

    const handleFundClick = async (toolId: string) => {
        try {
            setLoadingStates(prev => ({
                ...prev,
                [toolId]: { ...prev[toolId], fund: true }
            }));
            await axios.post(`http://localhost:5000/api/tools/${toolId}/fund`);
            await fetchTools();
        } catch (error) {
            console.error('Fund error:', error);
            alert('Failed to update fund count');
        } finally {
            setLoadingStates(prev => ({
                ...prev,
                [toolId]: { ...prev[toolId], fund: false }
            }));
        }
    };

    return (
        <div className="tool-form-container">
            <form onSubmit={handleSubmit} className="tool-form">
                <div className="form-group">
                    <input
                        type="text"
                        value={toolName}
                        onChange={(e) => setToolName(e.target.value)}
                        placeholder="Enter tool name"
                        required
                        className="tool-input"
                    />
                    <button type="submit" className="submit-button">
                        {editingId ? 'Update Tool' : 'Add Tool'}
                    </button>
                </div>
            </form>

            <h2 className="tools-heading">Available Tools</h2>
            <div className="tools-list">
                {tools.length === 0 ? (
                    <p className="no-tools">No tools added yet.</p>
                ) : (
                    tools.map((tool) => (
                        <div key={tool._id} className="tool-item">
                            <span className="tool-name">{tool.name}</span>
                            <div className="tool-actions">
                                <button
                                    onClick={() => handleWantClick(tool._id)}
                                    className="want-button"
                                    disabled={loadingStates[tool._id]?.want}
                                >
                                    ⭐ Want ({tool.wantCount || 0})
                                </button>
                                <button
                                    onClick={() => handleFundClick(tool._id)}
                                    className="fund-button"
                                    disabled={loadingStates[tool._id]?.fund}
                                >
                                    + Fund ({tool.fundCount || 0})
                                </button>
                                <button 
                                    onClick={() => handleEdit(tool)}
                                    className="edit-button"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(tool._id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ToolForm;
