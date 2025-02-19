import React from 'react';
import '../styles/index.css'; // Import styles

const SettingsPage: React.FC = () => {
    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <h1>Settings</h1>
            <p>Welcome to the Settings Page. Here you can configure your preferences.</p>
        </div>
    );
};

export default SettingsPage;
