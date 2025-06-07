import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Sidebar from './components/Sidebar';
import Homepage from './pages/Homepage';
import LLM01Page from './pages/LLM01Page';
import LLM01IndirectPage from './pages/LLM01IndirectPage';

import LLM02Page from './pages/LLM02Page';
import LLM05Page from './pages/LLM05Page';
import LLM06Page from './pages/LLM06Page';
import LLM07Page from './pages/LLM07Page';
import LLM09Page from './pages/LLM09Page';
import LLM10Page from './pages/LLM10Page';
import ExplanationPage from './pages/ExplanationPage';
import LLM08Page from './pages/LLM08Page';
import AutoAttackPage from './pages/AutoAttackPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/LLM01_2025" element={<LLM01Page />} />
              <Route path="/LLM01_2025/indirect" element={<LLM01IndirectPage />} />
              <Route path="/LLM02_2025" element={<LLM02Page />} />
              <Route path="/LLM03_2025" element={<ExplanationPage vulnerabilityId="LLM03_2025" />} />
              <Route path="/LLM04_2025" element={<ExplanationPage vulnerabilityId="LLM04_2025" />} />
              <Route path="/LLM05_2025" element={<LLM05Page />} />
              <Route path="/LLM06_2025" element={<LLM06Page />} />
              <Route path="/LLM07_2025" element={<LLM07Page />} />
              <Route path="/LLM08_2025" element={<LLM08Page />} />
              <Route path="/LLM09_2025" element={<LLM09Page />} />
              <Route path="/LLM10_2025" element={<LLM10Page />} />
              <Route path="/auto-attack" element={<AutoAttackPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
