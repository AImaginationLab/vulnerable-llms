import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

interface VectorData {
  id?: string;
  embedding?: number[];
  metadata?: any;
  similarity?: number;
  content?: string;
  score?: number;
  rank?: number;
}

interface InversionCandidate {
  word: string;
  similarity: number;
}

const LLM08Page: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'steal' | 'invert' | 'results'>('intro');
  const [stolenVectors, setStolenVectors] = useState<VectorData[]>([]);
  const [selectedVector, setSelectedVector] = useState<VectorData | null>(null);
  const [inversionResult, setInversionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Demo text for visual explanation
  const [demoText, setDemoText] = useState('');
  const [demoEmbedding, setDemoEmbedding] = useState<number[]>([]);
  const [loadingEmbed, setLoadingEmbed] = useState(false);

  const handleStealVectors = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/2025/vectors/search', {
        query: "password secret user authentication database",
        search_type: "adversarial",
        max_results: 5,
        similarity_threshold: 0.1
      });
      const vectors = resp.data.results || [];
      setStolenVectors(vectors);
      if (vectors.length > 0) {
        setSelectedVector(vectors[0]);
      }
      setStep('steal');
    } catch (err) {
      console.error('Error stealing vectors:', err);
    }
    setLoading(false);
  };

  const handleInvertVector = async () => {
    if (!selectedVector || !selectedVector.id) return;
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/2025/vectors/inversion', {
        target_ids: [selectedVector.id],
        attack_method: "gradient_based",
        max_candidates: 10,
        show_ground_truth: false
      });
      setInversionResult(resp.data);
      setStep('results');
    } catch (err) {
      console.error('Error inverting embedding:', err);
      // Show error message to user
      alert('Error: Unable to invert embedding. The document may not have a valid ID.');
    }
    setLoading(false);
  };

  const handleDemoEmbed = async () => {
    if (!demoText.trim()) return;
    setLoadingEmbed(true);
    
    // Don't clear previous embedding - keep it visible during loading
    
    try {
      // Get real embedding from the API
      const resp = await axios.post('/api/v1/2025/vectors/embed', demoText, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      if (resp.data.embedding) {
        // Use first 12 dimensions of the real embedding
        const newEmbedding = resp.data.embedding.slice(0, 12);
        setDemoEmbedding(newEmbedding);
      } else {
        // If no embedding returned, create a simple one based on text
        const simpleEmbedding = Array.from({ length: 12 }, (_, i) => 
          Math.sin((demoText.charCodeAt(i % demoText.length) + i) * 0.1) * (Math.random() * 0.5 + 0.5)
        );
        setDemoEmbedding(simpleEmbedding);
      }
    } catch (err) {
      console.error('Error creating demo embedding:', err);
      // On error, show a fallback embedding
      const fallbackEmbedding = Array.from({ length: 12 }, () => Math.random() * 2 - 1);
      setDemoEmbedding(fallbackEmbedding);
    }
    setLoadingEmbed(false);
  };

  const resetDemo = () => {
    setStep('intro');
    setStolenVectors([]);
    setSelectedVector(null);
    setInversionResult(null);
    setDemoText('');
    setDemoEmbedding([]);
  };

  return (
    <VulnerabilityPageLayout
      title="LLM08:2025 Vector and Embedding Weaknesses"
      overview="Vector databases store text as mathematical representations (embeddings) for efficient searching. However, these embeddings can leak sensitive information if an attacker gains access and uses inversion techniques to recover the original text."
      demoScenario="In this demo, we'll show how an attacker who gains access to a vector database can steal embeddings and potentially recover sensitive information through inversion attacks. This demonstrates why vector databases need strong access controls and encryption."
      mitigations={[
        '<strong>Encrypt Embeddings:</strong> Always encrypt vector data at rest and in transit',
        '<strong>Access Controls:</strong> Implement strong authentication and role-based access control for vector databases',
        '<strong>Differential Privacy:</strong> Add calibrated noise to embeddings to prevent accurate inversion',
        '<strong>Audit Logging:</strong> Monitor and alert on unusual embedding access patterns',
        '<strong>Data Minimization:</strong> Avoid storing sensitive data in vector databases when possible',
        '<strong>Regular Security Audits:</strong> Test for vector database vulnerabilities regularly',
      ]}
    >
      {/* Educational Embedding Demo - Always Visible */}
      <div className="demo-section">
        <h3>🧠 Understanding Embeddings</h3>
        <Card>
            <p style={{ marginBottom: '16px' }}>
              <strong>What are embeddings?</strong> When text is stored in a vector database, it's converted into 
              a series of numbers (a vector) that represents its meaning. Think of it like a fingerprint for text.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Try typing some text here..."
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '12px',
                  fontSize: '16px'
                }}
              />
              <button 
                onClick={handleDemoEmbed} 
                disabled={!demoText.trim() || loadingEmbed}
                className="button button-secondary"
              >
                {loadingEmbed ? '🔄 Converting...' : 'Convert to Embedding'}
              </button>
            </div>

            {demoEmbedding.length > 0 && (
              <div className="output-panel">
                <h4>Your text as an embedding vector:</h4>
                <div className="embedding-visualization">
                  {demoEmbedding.map((val, i) => {
                    const normalizedVal = Math.abs(val);
                    const isPositive = val > 0;
                    return (
                      <span
                        key={i}
                        className={`embedding-value ${isPositive ? 'positive' : 'negative'}`}
                        style={{
                          opacity: 0.5 + (normalizedVal * 0.5)
                        }}
                      >
                        {val.toFixed(3)}
                      </span>
                    )
                  })}
                </div>
                <div className="help-text">
                  💡 Each number represents a different aspect of your text's meaning. 
                  Real embeddings have hundreds or thousands of dimensions!
                </div>
              </div>
            )}
          </Card>
      </div>

      {/* Attack Demo Section */}
      {step === 'intro' && (
        <div className="demo-section">
          <Alert type="warning" title="The Security Risk">
            If an attacker gains access to these embeddings, they might be able to reverse-engineer 
            the original text using mathematical techniques. Let's see how this attack works...
          </Alert>
          
          <div style={{ marginTop: '16px' }}>
            <button 
              onClick={handleStealVectors} 
              disabled={loading}
              className="button button-danger"
            >
              {loading ? '🔄 Loading...' : '🚨 Start Attack Demonstration'}
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Steal Vectors */}
      {step === 'steal' && (
        <div className="demo-section">
          <h3>📥 Step 1: Stolen Embeddings</h3>
          <Alert type="danger" title="🔓 Unauthorized Access Simulated">
            The attacker has gained access to the vector database and retrieved the following embeddings:
          </Alert>

          <div style={{ marginTop: '20px' }}>
            {stolenVectors.map((vector, index) => (
              <div 
                key={vector.id}
                style={{ 
                  marginBottom: '12px',
                  cursor: 'pointer',
                  border: selectedVector?.id === vector.id ? '2px solid var(--accent-color)' : undefined,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedVector(vector)}
              >
                <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <strong>Document #{index + 1}</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>
                      ID: {vector.id || `doc-${index}`}
                    </p>
                    {vector.content && (
                      <p style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-primary)', 
                        margin: '8px 0',
                        maxHeight: '40px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        "{vector.content.substring(0, 100)}..."
                      </p>
                    )}
                  </div>
                  {selectedVector?.id === vector.id && (
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginLeft: '12px' }}>✓ Selected</span>
                  )}
                </div>
                
                {/* Show embedding preview if available */}
                {vector.embedding && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '8px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    overflow: 'hidden'
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Embedding preview:</span><br/>
                    [{vector.embedding.slice(0, 8).map((v: number) => v.toFixed(3)).join(', ')}...]
                  </div>
                )}
                </Card>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button onClick={resetDemo} className="button button-secondary">
              ← Back
            </button>
            <button 
              onClick={handleInvertVector} 
              disabled={!selectedVector || loading}
              className="button button-danger"
            >
              {loading ? '🔄 Loading...' : '🔄 Attempt Inversion Attack'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Show Results */}
      {step === 'results' && inversionResult && (
        <div className="demo-section">
          <h3>🔍 Step 2: Inversion Attack Results</h3>
          
          {inversionResult.inversion_results && inversionResult.inversion_results.length > 0 && inversionResult.inversion_results[0].candidates && inversionResult.inversion_results[0].candidates.length > 0 ? (
            <>
              <Alert type="danger" title="⚠️ Information Leaked!">
                The inversion attack successfully recovered potential words from the embedding:
              </Alert>

              <div className="demo-section">
                <Card title="🎯 Recovered Text Candidates">
                  {inversionResult.inversion_results[0].candidates
                    .filter((c: any) => c.method.includes('wordlist_inversion') || c.method === 'fallback_token_mapping')
                    .slice(0, 3)
                    .map((candidate: any, i: number) => {
                      const confidenceClass = candidate.confidence > 0.8 ? 'confidence-high' : 
                                            candidate.confidence > 0.6 ? 'confidence-medium' : 
                                            'confidence-low';
                      return (
                        <div
                          key={i}
                          className={`candidate-card ${candidate.confidence > 0.7 ? 'high-confidence' : ''}`}
                        >
                          <div className="candidate-header">
                            <div>
                              <div className="candidate-text">
                                "{candidate.recovered_text}"
                              </div>
                              <div className="help-text">
                                Method: {candidate.method.replace(/_/g, ' ')}
                              </div>
                            </div>
                            <span className={`candidate-confidence ${confidenceClass}`}>
                              {(candidate.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </Card>
              </div>

              {/* Individual Word Matches */}
              <div className="demo-section">
                <Card title="🔤 Individual Word Matches">
                  <div className="word-match-grid">
                    {inversionResult.inversion_results[0].candidates
                      .filter((c: any) => c.method === 'single_word_match')
                      .map((candidate: any, i: number) => (
                        <div
                          key={i}
                          className="word-match"
                          style={{
                            background: `rgba(239, 68, 68, ${candidate.confidence * 0.3})`
                          }}
                        >
                          <div className="word-match-text">
                            {candidate.recovered_text}
                          </div>
                          <div className="word-match-score">
                            {(candidate.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>

              {inversionResult.attack_effectiveness > 0 && (
                <div className="demo-section">
                  <Card title="📊 Attack Statistics">
                    <div className="output-panel">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div>
                          <div className="help-text">Attack Effectiveness</div>
                          <div className="candidate-confidence confidence-high" style={{ fontSize: '24px' }}>
                            {inversionResult.attack_effectiveness}%
                          </div>
                        </div>
                        <div>
                          <div className="help-text">Risk Level</div>
                          <div className="candidate-confidence confidence-medium" style={{ fontSize: '24px' }}>
                            {inversionResult.risk_assessment}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Alert type="success" title="✅ Inversion Failed">
              The embedding could not be inverted to recover meaningful information. 
              This could be due to differential privacy, noise, or other protective measures.
            </Alert>
          )}

          <div style={{ marginTop: '24px' }}>
            <button onClick={resetDemo} className="button button-primary">
              🔄 Try Again
            </button>
          </div>

          {/* Advanced Settings (hidden by default) */}
          <div style={{ marginTop: '32px' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Details
            </button>
            
            {showAdvanced && (
              <div style={{ marginTop: '16px' }}>
                <Card>
                <h4>🔧 Attack Parameters Used</h4>
                <ul style={{ fontSize: '14px', marginTop: '12px' }}>
                  <li><strong>Attack Method:</strong> Gradient-based inversion</li>
                  <li><strong>Vocabulary Size:</strong> ~10,000 common words</li>
                  <li><strong>Similarity Threshold:</strong> 0.7</li>
                  <li><strong>Model:</strong> Sentence-transformers embedding model</li>
                </ul>
                <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Real-world attacks might use more sophisticated techniques including:
                  neural network inversion, dictionary attacks, or side-channel analysis.
                </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Footer */}
      <div className="demo-section">
        <h3>📚 Why This Matters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <Card>
            <h4>🏢 Real-World Impact</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Many companies use vector databases for semantic search, RAG systems, and recommendation engines. 
              Without proper security, sensitive customer data, proprietary information, or personal details 
              could be exposed.
            </p>
          </Card>
          
          <Card>
            <h4>🎯 Attack Vectors</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Attackers might gain access through database vulnerabilities, insider threats, 
              misconfigured cloud storage, or supply chain attacks on vector database providers.
            </p>
          </Card>
          
          <Card>
            <h4>🛡️ Defense Strategies</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Implement defense-in-depth: encryption, access controls, monitoring, 
              differential privacy, and regular security audits of your vector infrastructure.
            </p>
          </Card>
        </div>
      </div>
    </VulnerabilityPageLayout>
  );
};

export default LLM08Page;