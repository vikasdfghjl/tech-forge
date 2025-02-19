import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ToolForm.css';

interface Tool {
    _id: string;
    name: string;
    wantCount: number;
    fundCount: number;
    createdAt: string;
    comments: Comment[]; // Add comments property
}

interface Comment {
    _id: string;
    text: string;
    likes: number;
}

const ToolForm = () => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [toolName, setToolName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loadingStates, setLoadingStates] = useState<{[key: string]: {want: boolean, fund: boolean}}>({});
    const [sortOption, setSortOption] = useState('latest');
    const [newComment, setNewComment] = useState<{[key: string]: string}>({});

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
            const response = await axios.post(`http://localhost:5000/api/tools/${toolId}/increment-want`);
            console.log('Want count incremented:', response.data);
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
            const response = await axios.post(`http://localhost:5000/api/tools/${toolId}/increment-fund`); // Ensure this URL is correct
            console.log('Fund count incremented:', response.data);
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

    const handleAddComment = async (toolId: string) => {
        try {
            await axios.post(`http://localhost:5000/api/tools/${toolId}/comments`, { text: newComment[toolId] });
            setNewComment(prev => ({ ...prev, [toolId]: '' }));
            await fetchTools();
        } catch (error) {
            console.error('Add comment error:', error);
            alert('Failed to add comment');
        }
    };

    const handleLikeComment = async (toolId: string, commentId: string) => {
        try {
            await axios.post(`http://localhost:5000/api/tools/${toolId}/comments/${commentId}/like`);
            await fetchTools();
        } catch (error) {
            console.error('Like comment error:', error);
            alert('Failed to like comment');
        }
    };

    const sortTools = (tools: Tool[]) => {
        switch (sortOption) {
            case 'latest':
                return tools.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'ascending':
                return tools.sort((a, b) => (a.wantCount + a.fundCount) - (b.wantCount + b.fundCount));
            case 'descending':
                return tools.sort((a, b) => (b.wantCount + b.fundCount) - (a.wantCount + a.fundCount));
            default:
                return tools;
        }
    };

    const sortedTools = sortTools(tools);

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

            <div className="sort-options">
                <label>
                    Sort by:
                    <select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="latest">Latest</option>
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </select>
                </label>
            </div>

            <h2 className="tools-heading">Available Tools</h2>
            <div className="tools-list">
                {sortedTools.length === 0 ? (
                    <p className="no-tools">No tools added yet.</p>
                ) : (
                    sortedTools.map((tool, index) => (
                        <div key={tool._id} className="tool-item">
                            <span className="tool-index">{index + 1}. </span> {/* Add index number */}
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
                            <div className="comments-section">
                                <h3>Comments</h3>
                                {tool.comments?.map(comment => ( // Ensure tool.comments is defined
                                    <div key={comment._id} className="comment-item">
                                        <span>{comment.text}</span>
                                        <button 
                                            onClick={() => handleLikeComment(tool._id, comment._id)}
                                            className="like-button"
                                        >
                                            👍 {comment.likes}
                                        </button>
                                    </div>
                                ))}
                                <div className="add-comment">
                                    <input
                                        type="text"
                                        value={newComment[tool._id] || ''}
                                        onChange={(e) => setNewComment(prev => ({ ...prev, [tool._id]: e.target.value }))}
                                        placeholder="Add a comment"
                                    />
                                    <button 
                                        onClick={() => handleAddComment(tool._id)}
                                        className="add-comment-button"
                                    >
                                        Add Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ToolForm;
