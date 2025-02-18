import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav>
            <ul style={{ display: 'flex', listStyleType: 'none', padding: 0 }}>
                <li style={{ marginRight: '20px' }}><Link to="/home">Home</Link></li> {/* Update Home link */}
                <li style={{ marginRight: '20px' }}><Link to="/tools">Tools</Link></li> {/* Replace Projects with Tools */}
                <li style={{ marginRight: '20px' }}><Link to="/about">About</Link></li>
                <li style={{ marginRight: '20px' }}><Link to="/settings">Settings</Link></li>
                {/* Add other links as needed */}
            </ul>
        </nav>
    );
};

export default Navbar;
