import React from 'react';
import '../styles/index.css'; // Import styles

const AboutPage: React.FC = () => {
    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <h1>About Us</h1>
            <p>Welcome to the About Page. Here you can find more information about our project.</p>
        </div>
    );
};

export default AboutPage;
