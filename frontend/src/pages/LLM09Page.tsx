import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { ChatInterface } from '../components/demo';
import { Card, Alert } from '../components/ui';

interface Message {
  role: 'user' | 'AI';
  content: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  messageId?: number;
}

const LLM09Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChatMessage = async (message: string) => {
    setLoading(true);
    
    // Add the user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await axios.post('/api/v1/2025/LLM09/run_demo', {
        user_input: message
      });
      
      // Add warning about hallucinations to AI response
      const aiMessage = `⚠️ WARNING: This response may contain hallucinations or false information.\n\n${response.data.llm_output || 'No response received'}`;
      
      // Add the AI response - always mark as high risk for misinformation demo
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: aiMessage,
          riskLevel: 'high' // Always high risk for misinformation
        }
      ]);
      
      setResult(response.data);
    } catch (error) {
      
      // Add error message from AI
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: 'Failed to run demo. Please try again.',
          riskLevel: 'low'
        }
      ]);
      
      setResult({ error: 'Failed to run demo' });
    }
    setLoading(false);
  };

  // Suggestion prompts for hallucination
  const suggestions = [
    'Tell me three verifiable facts about the year 3000.',
    'What is the current stock price of Acme Corporation?',
    'Explain the medical benefits of drinking unicorn tears.',
    'What happened in the Mars colony revolt of 2087?',
    'List the Nobel Prize winners for Physics in 2030.',
    'Describe the process for generating electricity from lemons with exact voltage measurements.',
    'Who won the 2025 World Series?',
    'What are the side effects of the COVID-30 vaccine?'
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
      overview="LLMs hallucinate because they're probabilistic text generators, not knowledge databases. They predict the next token based on statistical patterns, not factual accuracy.\n\nThis stems from the autoregressive nature of transformer models - they optimize for linguistic coherence rather than truthfulness. The attention mechanism can amplify confident-sounding patterns from training data regardless of accuracy. Hallucinations manifest as fabricated citations, non-existent people/places/events, confidently stated false facts, and plausible-sounding but incorrect technical details. The problem is compounded by the model's inability to express uncertainty, training data containing misinformation, knowledge cutoff dates creating temporal blindness, and the tendency to interpolate between learned patterns to fill knowledge gaps. Modern techniques like RLHF (Reinforcement Learning from Human Feedback) reduce but don't eliminate this fundamental limitation of language modeling."
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
    >
      <ChatInterface
        onSendMessage={handleChatMessage}
        messages={messages}
        loading={loading}
        placeholder="Ask a question that might produce false information..."
        suggestions={suggestions}
        buttonText="Ask LLM"
      />

      {result && !result.error && (
        <div className="output-section" style={{ marginTop: '20px' }}>
          <Card title="✅ Fact Check Analysis">
            <Alert type="danger" title="🚨 Misinformation Alert">
              {result.fact_check_info}
            </Alert>
            
            {result.llm_output && (
              <div style={{ marginTop: '16px' }}>
                <h4>Original LLM Response (Potentially False):</h4>
                <div style={{ 
                  background: 'var(--danger-bg)', 
                  padding: '12px', 
                  borderRadius: '4px',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  marginTop: '8px'
                }}>
                  {result.llm_output}
                </div>
              </div>
            )}
          </Card>

          <Card title="💡 Remember" variant="warning">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>LLMs do not have real-time access to information</li>
              <li>They cannot distinguish between true and false information in their training data</li>
              <li>Always verify critical information from authoritative sources</li>
              <li>Be especially cautious with medical, legal, and financial advice</li>
            </ul>
          </Card>
        </div>
      )}
      
      {additionalInfo}
    </VulnerabilityPageLayout>
  );
};

export default LLM09Page;