import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Button, Grid } from '@mui/material'; // Import Material-UI components
import Navbar from './components/Navbar';
import ToolForm from './components/ToolForm';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import { motion } from 'framer-motion'; // Import framer-motion for animations

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = (profile: any) => {
        console.log('User logged in:', profile);
        setIsLoggedIn(true);
    };

    const handleLogoutSuccess = () => {
        console.log('User logged out');
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <CssBaseline /> {/* Add CssBaseline for Material-UI styling */}
            <AppBar position="static"> {/* Use AppBar for the Navbar */}
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Tech Forge
                    </Typography>
                    <Button color="inherit">Login</Button> {/* Add a login button */}
                </Toolbar>
            </AppBar>
            <Container> {/* Use Container for consistent padding */}
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Routes>
                                <Route path="/home" element={<HomePage />} />
                                <Route path="/tools" element={<ToolForm user={{ name: 'John Doe', id: 1 }} />} />
                                <Route path="/about" element={<AboutPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                {/* Add other routes as needed */}
                            </Routes>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Router>
    );
};

export default App;