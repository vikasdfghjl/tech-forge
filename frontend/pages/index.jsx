import React from 'react';
import ToolList from '../components/ToolList';
import '../styles/ToolList.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header>
        <h1>Tooltopia - Vote for Your Favorite Tools</h1>
      </header>
      
      <main>
        <ToolList />
      </main>
    </div>
  );
};

export default HomePage;
