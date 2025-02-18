import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import Navbar
import ToolForm from './components/ToolForm'; // Import ToolForm
import AboutPage from './pages/AboutPage'; // Import AboutPage
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage
import HomePage from './pages/HomePage'; // Import HomePage
// ...other imports...

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Navbar /> {/* Add Navbar */}
                <Routes>
                    <Route path="/home" element={<HomePage />} /> {/* Update Home route */}
                    <Route path="/tools" element={<ToolForm />} /> {/* Use ToolForm for Tools route */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Add other routes as needed */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;