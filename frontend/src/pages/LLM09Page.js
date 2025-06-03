import React, { useState } from 'react';
import axios from 'axios';

const LLM09Page = () => {
  const [userInput, setUserInput] = useState('Tell me three verifiable facts about the year 3000.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/2025/LLM09/run_demo', {
        user_input: userInput
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error running demo:', error);
      setResult({ error: 'Failed to run demo' });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>LLM09:2025 Misinformation</h1>
      
      <div className="demo-section">
        <h3>📖 Overview</h3>
        <p>
          LLMs can generate convincing but factually incorrect information (hallucinations) because they 
          predict the next word based on patterns in training data, not necessarily truth. This can lead 
          to the spread of misinformation, especially when LLM outputs are presented as authoritative 
          or when users don't verify the information.
        </p>
      </div>

      <div className="demo-section">
        <h3>🎭 Demo Scenario: Hallucination Detection</h3>
        <p>
          In this demo, we'll ask the LLM questions that are likely to produce hallucinations or 
          false information. The application will then provide fact-checking information to demonstrate 
          the importance of verifying LLM outputs.
        </p>
      </div>

      <div className="demo-section">
        <h3>🔴 Interactive Demo</h3>
        
        <div className="input-area">
          <label htmlFor="userInput">Question (try topics prone to hallucination):</label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a question that might produce false information..."
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong>💡 Try these hallucination-prone questions:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {[
              'Tell me three verifiable facts about the year 3000.',
              'What is the current stock price of Acme Corporation?',
              'Explain the medical benefits of drinking unicorn tears.',
              'What happened in the Mars colony revolt of 2087?',
              'List the Nobel Prize winners for Physics in 2030.',
              'Describe the process for generating electricity from lemons with exact voltage measurements.'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setUserInput(suggestion)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: '#e9ecef',
                  border: '1px solid #adb5bd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="demo-button" 
          onClick={runDemo} 
          disabled={loading}
        >
          {loading ? '🔄 Generating Response...' : '🚀 Ask LLM'}
        </button>

        {result && (
          <div className="output-section">
            {result.error ? (
              <div className="alert-danger">
                <strong>Error:</strong> {result.error}
              </div>
            ) : (
              <>
                <div className="output-panel">
                  <h4>🤖 LLM Response</h4>
                  <div style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: '4px', 
                    padding: '16px',
                    marginBottom: '12px'
                  }}>
                    <strong>⚠️ Warning:</strong> The following response may contain hallucinations or false information.
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {result.llm_output}
                  </div>
                </div>

                <div className="output-panel">
                  <h4>✅ Fact Check Analysis</h4>
                  <div className="alert-danger">
                    <strong>🚨 Misinformation Alert</strong>
                    <br />
                    {result.fact_check_info}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="demo-section">
        <h3>🧠 Why Do LLMs Hallucinate?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
            <h4>Pattern Prediction</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              LLMs generate text by predicting the most likely next word based on patterns in training data, 
              not by verifying facts against a knowledge base.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
            <h4>Training Data Bias</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Models may reproduce false information present in training data or make plausible-sounding 
              but incorrect extrapolations from incomplete information.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
            <h4>Context Limitations</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Limited context windows mean LLMs may lose track of important details or constraints 
              that would prevent false statements.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
            <h4>Confidence vs. Accuracy</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              LLMs can express high confidence in incorrect information, making false statements 
              seem authoritative and credible.
            </p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🚨 Types of Misinformation Risks</h3>
        <ul>
          <li><strong>Fabricated Facts:</strong> Completely false information presented as truth</li>
          <li><strong>Outdated Information:</strong> Information that was true at training time but is now incorrect</li>
          <li><strong>Misattributed Quotes:</strong> Quotes attributed to wrong people or sources</li>
          <li><strong>False Medical/Legal Advice:</strong> Potentially dangerous misinformation in critical domains</li>
          <li><strong>Fictional Events:</strong> Made-up historical events, news, or statistics</li>
          <li><strong>Biased or Prejudiced Content:</strong> Reflecting harmful biases present in training data</li>
        </ul>
      </div>

      <div className="demo-section">
        <h3>📊 High-Risk Domains</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px' }}>
            <h4>🏥 Medical Information</h4>
            <p style={{ fontSize: '14px', margin: 0, color: '#721c24' }}>
              False medical advice can be life-threatening. Always consult healthcare professionals.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px' }}>
            <h4>⚖️ Legal Advice</h4>
            <p style={{ fontSize: '14px', margin: 0, color: '#721c24' }}>
              Incorrect legal information can have serious consequences. Consult qualified attorneys.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px' }}>
            <h4>💰 Financial Advice</h4>
            <p style={{ fontSize: '14px', margin: 0, color: '#721c24' }}>
              False financial information can lead to significant monetary losses.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px' }}>
            <h4>📰 Current Events</h4>
            <p style={{ fontSize: '14px', margin: 0, color: '#721c24' }}>
              Models may not have up-to-date information or may fabricate news events.
            </p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🛡️ Mitigation Strategies</h3>
        <ul>
          <li><strong>Fact-Checking Integration:</strong> Implement real-time fact-checking against authoritative sources</li>
          <li><strong>Confidence Scoring:</strong> Display confidence levels and uncertainty indicators</li>
          <li><strong>Source Attribution:</strong> Require LLMs to cite sources when making factual claims</li>
          <li><strong>Domain Restrictions:</strong> Limit LLM use in high-risk domains like medical or legal advice</li>
          <li><strong>Human Oversight:</strong> Implement human review for critical information</li>
          <li><strong>Disclaimer Requirements:</strong> Always include warnings about potential inaccuracies</li>
          <li><strong>User Education:</strong> Train users to critically evaluate and verify LLM outputs</li>
          <li><strong>Regular Updates:</strong> Continuously update models with current, verified information</li>
        </ul>
      </div>
    </div>
  );
};

export default LLM09Page;