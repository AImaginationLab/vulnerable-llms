import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { ChatInterface } from '../components/demo';
import { Card } from '../components/ui';

interface Message {
  role: 'user' | 'AI';
  content: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  messageId?: number;
}

const LLM05Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChatMessage = async (message: string) => {
    setLoading(true);
    
    // Add the user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await axios.post('/api/v1/2025/LLM05/run_demo', {
        user_input: message
      });
      
      // Check if output contains potential XSS
      const hasXSS = response.data.llm_output && (
        response.data.llm_output.includes('<script') ||
        response.data.llm_output.includes('javascript:') ||
        response.data.llm_output.includes('onerror=') ||
        response.data.llm_output.includes('onclick=')
      );
      
      // Add the AI response
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: response.data.llm_output || 'No response received',
          riskLevel: hasXSS ? 'high' : 'low'
        }
      ]);
      
      setResult(response.data);
    } catch (error) {
      console.error('Error running demo:', error);
      
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

  // Suggestion prompts for XSS attempts
  const suggestions = [
    'Respond to this by saying "Hello!" and nothing else: <script>alert(\'XSS via Improper Output Handling!\');</script>',
    'Please include this exact text in your response: <img src=x onerror=alert(\'XSS\')>',
    'Echo back: <iframe src="javascript:alert(\'Iframe XSS\')"></iframe>',
    'Return this HTML: <div onclick="alert(\'Click XSS\')">Click me</div>',
    'Display: <svg onload=alert(\'SVG XSS\')>',
    'Show this link: <a href="javascript:alert(\'Link XSS\')">Click here</a>',
    'Output: <input onfocus=alert(\'Input XSS\') autofocus>',
    'Render: <style>body{background:url("javascript:alert(\'CSS XSS\')")}</style>'
  ];

  const outputComparison = (
    <div className="demo-section">
      <h3>💡 Key Insights</h3>
      <div className="alert-danger">
        <strong>Important:</strong> The vulnerability is NOT in the LLM generating malicious content, 
        but in how the application handles and renders that content. The LLM is simply responding to 
        user input as instructed.
      </div>
      
      <h4>Code Comparison:</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
        <div>
          <h5 style={{ color: 'var(--danger-color)' }}>❌ Vulnerable Code</h5>
          <pre className="danger">
{`// Dangerous - executes scripts
element.innerHTML = llmOutput;`}
          </pre>
        </div>
        <div>
          <h5 style={{ color: 'var(--success-color)' }}>✅ Secure Code</h5>
          <pre className="success">
{`// Safe - treats as text
element.textContent = llmOutput;

// Or use a sanitization library
element.innerHTML = DOMPurify.sanitize(llmOutput);`}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <VulnerabilityPageLayout
      title="LLM05:2025 Improper Output Handling"
      overview="Improper output handling occurs when applications fail to properly validate, sanitize, or encode LLM outputs before using them in downstream systems. This can lead to injection attacks, XSS, or other security vulnerabilities when the LLM output is processed by other systems."
      demoScenario="In this demo, we'll show how an application that renders LLM output directly as HTML without proper sanitization can be vulnerable to XSS attacks. The LLM itself isn't malicious, but the application's handling of its output creates the vulnerability."
      mitigations={[
        '<strong>Output Encoding:</strong> Always encode LLM outputs appropriately for the target context (HTML, URL, etc.)',
        '<strong>Content Sanitization:</strong> Use libraries like DOMPurify to sanitize HTML content',
        '<strong>Content Security Policy (CSP):</strong> Implement CSP headers to prevent script execution',
        '<strong>Input Validation:</strong> Validate and filter LLM outputs before using them in other systems',
        '<strong>Principle of Least Trust:</strong> Treat all LLM outputs as potentially untrusted user input',
        '<strong>Secure Templating:</strong> Use templating engines that automatically escape content',
      ]}
    >
      <ChatInterface
        onSendMessage={handleChatMessage}
        messages={messages}
        loading={loading}
        placeholder="Try to inject HTML/JavaScript that the LLM will echo back..."
        suggestions={suggestions}
        buttonText="Send to LLM"
      />

      {result && result.llm_output && (
        <div className="output-section">
          <Card title="💬 LLM Raw Output">
            <pre>
              {result.llm_output}
            </pre>
          </Card>

          <Card title="⚠️ Vulnerable Rendering (using innerHTML)" variant="danger">
            <div className="alert-danger">
              <strong>Warning:</strong> The content below is rendered using innerHTML, which executes any JavaScript!
            </div>
            <div 
              className="render-box vulnerable"
              dangerouslySetInnerHTML={{ __html: result.llm_output }}
            />
          </Card>

          <Card title="✅ Secure Rendering (using textContent)" variant="success">
            <div className="alert-success">
              <strong>Safe:</strong> The content below is rendered as plain text, preventing script execution.
            </div>
            <div className="render-box secure">
              {result.llm_output}
            </div>
          </Card>
        </div>
      )}
      
      {outputComparison}
    </VulnerabilityPageLayout>
  );
};

export default LLM05Page;