import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { InteractiveDemo } from '../components/demo';
import { Card, Alert } from '../components/ui';

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

  const suggestions = [
    'Tell me three verifiable facts about the year 3000.',
    'What is the current stock price of Acme Corporation?',
    'Explain the medical benefits of drinking unicorn tears.',
    'What happened in the Mars colony revolt of 2087?',
    'List the Nobel Prize winners for Physics in 2030.',
    'Describe the process for generating electricity from lemons with exact voltage measurements.'
  ];

  const additionalInfo = (
    <div>
      <div className="demo-section">
        <h3>🧠 Why Do LLMs Hallucinate?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>Pattern Prediction</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              LLMs generate text by predicting the most likely next word based on patterns in training data, 
              not by verifying facts against a knowledge base.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>Training Data Bias</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Models may reproduce false information present in training data or make plausible-sounding 
              but incorrect extrapolations from incomplete information.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>Context Limitations</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Limited context windows mean LLMs may lose track of important details or constraints 
              that would prevent false statements.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
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
          <div style={{ padding: '16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '6px' }}>
            <h4>🏥 Medical Information</h4>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--danger-text)' }}>
              False medical advice can be life-threatening. Always consult healthcare professionals.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '6px' }}>
            <h4>⚖️ Legal Advice</h4>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--danger-text)' }}>
              Incorrect legal information can have serious consequences. Consult qualified attorneys.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '6px' }}>
            <h4>💰 Financial Advice</h4>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--danger-text)' }}>
              False financial information can lead to significant monetary losses.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '6px' }}>
            <h4>📰 Current Events</h4>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--danger-text)' }}>
              Models may not have up-to-date information or may fabricate news events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VulnerabilityPageLayout
      title="LLM09:2025 Misinformation"
      overview="LLMs can generate convincing but factually incorrect information (hallucinations) because they predict the next word based on patterns in training data, not necessarily truth. This can lead to the spread of misinformation, especially when LLM outputs are presented as authoritative or when users don't verify the information."
      demoScenario="In this demo, we'll ask the LLM questions that are likely to produce hallucinations or false information. The application will then provide fact-checking information to demonstrate the importance of verifying LLM outputs."
      mitigations={[
        '<strong>Fact-Checking Integration:</strong> Implement real-time fact-checking against authoritative sources',
        '<strong>Confidence Scoring:</strong> Display confidence levels and uncertainty indicators',
        '<strong>Source Attribution:</strong> Require LLMs to cite sources when making factual claims',
        '<strong>Domain Restrictions:</strong> Limit LLM use in high-risk domains like medical or legal advice',
        '<strong>Human Oversight:</strong> Implement human review for critical information',
        '<strong>Disclaimer Requirements:</strong> Always include warnings about potential inaccuracies',
        '<strong>User Education:</strong> Train users to critically evaluate and verify LLM outputs',
        '<strong>Regular Updates:</strong> Continuously update models with current, verified information',
      ]}
      additionalContent={additionalInfo}
    >
      <InteractiveDemo
        userInput={userInput}
        setUserInput={setUserInput}
        onRunDemo={runDemo}
        loading={loading}
        buttonText="🚀 Ask LLM"
        inputLabel="Question (try topics prone to hallucination):"
        inputPlaceholder="Ask a question that might produce false information..."
        suggestions={suggestions}
      />

      {result && (
        <div className="output-section">
          {result.error ? (
            <Alert type="danger" title="Error:">
              {result.error}
            </Alert>
          ) : (
            <>
              <Card title="🤖 LLM Response">
                <Alert type="warning" title="⚠️ Warning:">
                  The following response may contain hallucinations or false information.
                </Alert>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '12px' }}>
                  {result.llm_output}
                </div>
              </Card>

              <Card title="✅ Fact Check Analysis">
                <Alert type="danger" title="🚨 Misinformation Alert">
                  {result.fact_check_info}
                </Alert>
              </Card>
            </>
          )}
        </div>
      )}
    </VulnerabilityPageLayout>
  );
};

export default LLM09Page;
