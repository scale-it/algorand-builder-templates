import './App.css';

import { Typography } from '@material-ui/core';
import React from 'react';

import Signer from './components/signer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Typography variant="h4"> Buy Concert tickets </Typography>
        <Signer />
      </header>
    </div>
  );
}

export default App;
