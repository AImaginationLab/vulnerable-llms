import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { InteractiveDemo } from '../components/demo';
import { Card } from '../components/ui';

const LLM05Page = () => {
  const [userInput, setUserInput] = useState('Respond to this by saying "Hello!" and nothing else: <script>alert(\'XSS via Improper Output Handling!\');</script>');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/2025/LLM05/run_demo', {
        user_input: userInput
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error running demo:', error);
      setResult({ error: 'Failed to run demo' });
    }
    setLoading(false);
  };

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
          <h5 style={{ color: '#dc3545' }}>❌ Vulnerable Code</h5>
          <pre style={{ background: '#f8d7da', padding: '12px', borderRadius: '4px', fontSize: '12px' }}>
{`// Dangerous - executes scripts
element.innerHTML = llmOutput;`}
          </pre>
        </div>
        <div>
          <h5 style={{ color: '#28a745' }}>✅ Secure Code</h5>
          <pre style={{ background: '#d4edda', padding: '12px', borderRadius: '4px', fontSize: '12px' }}>
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
      <InteractiveDemo
        userInput={userInput}
        setUserInput={setUserInput}
        onRunDemo={runDemo}
        loading={loading}
        buttonText="🚀 Send to LLM"
        inputLabel="Input (try to inject HTML/JavaScript):"
        inputPlaceholder="Enter your input that might include HTML/JS..."
      />

      {result && (
        <div className="output-section">
          {result.error ? (
            <Card variant="danger">
              <strong>Error:</strong> {result.error}
            </Card>
          ) : (
            <>
              <Card title="💬 LLM Raw Output">
                <div style={{ fontFamily: 'monospace', background: '#f8f9fa', padding: '12px', border: '1px solid #e9ecef' }}>
                  {result.llm_output}
                </div>
              </Card>

              <Card title="⚠️ Vulnerable Rendering (using innerHTML)" variant="danger">
                <div className="alert-danger">
                  <strong>Warning:</strong> The content below is rendered using innerHTML, which executes any JavaScript!
                </div>
                <div 
                  style={{ 
                    background: '#fff', 
                    padding: '12px', 
                    border: '2px solid #dc3545', 
                    borderRadius: '4px',
                    minHeight: '40px'
                  }}
                  dangerouslySetInnerHTML={{ __html: result.llm_output }}
                />
              </Card>

              <Card title="✅ Secure Rendering (using textContent)" variant="success">
                <div className="alert-success">
                  <strong>Safe:</strong> The content below is rendered as plain text, preventing script execution.
                </div>
                <div 
                  style={{ 
                    background: '#fff', 
                    padding: '12px', 
                    border: '2px solid #28a745', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    minHeight: '40px'
                  }}
                >
                  {result.llm_output}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
      
      {outputComparison}
    </VulnerabilityPageLayout>
  );
};

export default LLM05Page;
