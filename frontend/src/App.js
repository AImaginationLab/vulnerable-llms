import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Homepage from './pages/Homepage';
import LLM01Page from './pages/LLM01Page';
import LLM02Page from './pages/LLM02Page';
import LLM05Page from './pages/LLM05Page';
import LLM06Page from './pages/LLM06Page';
import LLM07Page from './pages/LLM07Page';
import LLM09Page from './pages/LLM09Page';
import LLM10Page from './pages/LLM10Page';
import ExplanationPage from './pages/ExplanationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/LLM01_2025" element={<LLM01Page />} />
            <Route path="/LLM02_2025" element={<LLM02Page />} />
            <Route path="/LLM03_2025" element={<ExplanationPage vulnerabilityId="LLM03_2025" />} />
            <Route path="/LLM04_2025" element={<ExplanationPage vulnerabilityId="LLM04_2025" />} />
            <Route path="/LLM05_2025" element={<LLM05Page />} />
            <Route path="/LLM06_2025" element={<LLM06Page />} />
            <Route path="/LLM07_2025" element={<LLM07Page />} />
            <Route path="/LLM08_2025" element={<ExplanationPage vulnerabilityId="LLM08_2025" />} />
            <Route path="/LLM09_2025" element={<LLM09Page />} />
            <Route path="/LLM10_2025" element={<LLM10Page />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;