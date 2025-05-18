import React from 'react';
import Scene from './scenes/Scene';

const App: React.FC = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#1d3d70'
    }}>
      <Scene />
    </div>
  );
};

export default App;
