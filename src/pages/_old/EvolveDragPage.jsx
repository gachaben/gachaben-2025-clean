import React from 'react';
import RouletteComponent from '../components/RouletteComponent';
import '../styles/Roulette.css';

const EvolveDragPage = () => {
  return (
    <div>
      <h1 style={{ color: 'white', textAlign: 'center' }}>進化ルーレット</h1>
      <RouletteComponent />
    </div>
  );
};

export default EvolveDragPage;
