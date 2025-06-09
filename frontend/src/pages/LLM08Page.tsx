import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

interface VectorData {
  id?: string;
  embedding?: number[];
  metadata?: any;
  similarity?: number;
  content?: string;
  score?: number;
  rank?: number;
}

const LLM08Page: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: intro, 1: steal, 2: invert, 3: results
  const [stolenVectors, setStolenVectors] = useState<VectorData[]>([]);
  const [selectedVector, setSelectedVector] = useState<VectorData | null>(null);
  const [inversionResult, setInversionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      setCurrentStep(1); // Move to steal step
    } catch (err) {
      // Handle error silently
    }
    setLoading(false);
  };

  const handleInvertVector = async () => {
    if (!selectedVector || !selectedVector.id) return;
    setLoading(true);
    // Clear previous results to ensure fresh render
    setInversionResult(null);

    try {
      const resp = await axios.post('/api/v1/2025/vectors/inversion', {
        target_ids: [selectedVector.id],
        attack_method: "gradient_based",
        max_candidates: 10,
        show_ground_truth: false,
        // Add timestamp to ensure fresh results
        timestamp: Date.now()
      });
      setInversionResult(resp.data);
      setCurrentStep(2); // Move to results step
    } catch (err) {
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
      // On error, show a fallback embedding
      const fallbackEmbedding = Array.from({ length: 12 }, () => Math.random() * 2 - 1);
      setDemoEmbedding(fallbackEmbedding);
    }
    setLoadingEmbed(false);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setStolenVectors([]);
    setSelectedVector(null);
    setInversionResult(null);
    setDemoText('');
    setDemoEmbedding([]);
  };

  return (
    <VulnerabilityPageLayout
      title="LLM08:2025 Vector and Embedding Weaknesses"
      overview="Vector databases store text as mathematical representations (embeddings) that preserve semantic meaning in high-dimensional space. While designed for privacy through abstraction, these embeddings retain recoverable information.\n\nThis vulnerability exploits the fact that embeddings preserve semantic relationships and word clusters in vector space. Inversion attacks use gradient descent, nearest neighbor searches against known word embeddings, or adversarial machine learning to reconstruct original text. The attack surface includes exposed embeddings through API endpoints, database breaches, model weight extraction, or memory dumps. Modern embedding models like BERT, Sentence-BERT, and others create dense representations where similar concepts cluster together - this clustering enables sophisticated reconstruction attacks that can recover PII, trade secrets, or confidential documents from supposedly 'anonymous' vector data."
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
              <Button
                onClick={handleDemoEmbed}
                disabled={!demoText.trim() || loadingEmbed}
                variant="secondary"
                loading={loadingEmbed}
              >
                Convert to Embedding
              </Button>
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

      {/* Attack Flow - Progressive UI */}
      <div className="demo-section">
        <h3>🎯 Attack Demonstration</h3>

        {/* Step Indicator */}
        <div className="attack-steps">
          <div
            className={`step ${currentStep >= 0 ? 'active' : ''} ${currentStep === 0 ? 'current' : ''}`}
            onClick={() => currentStep > 0 && setCurrentStep(0)}
            style={{ cursor: currentStep > 0 ? 'pointer' : 'default' }}
          >
            <span className="step-number">1</span>
            <span className="step-label">Start Attack</span>
          </div>
          <div
            className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep === 1 ? 'current' : ''}`}
            onClick={() => {
              if (currentStep > 1) setCurrentStep(1);
              else if (currentStep < 1 && stolenVectors.length > 0) setCurrentStep(1);
            }}
            style={{ cursor: (currentStep > 1 || (currentStep < 1 && stolenVectors.length > 0)) ? 'pointer' : 'default' }}
          >
            <span className="step-number">2</span>
            <span className="step-label">Select Target</span>
          </div>
          <div
            className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep === 2 ? 'current' : ''}`}
            onClick={() => currentStep > 2 && inversionResult && setCurrentStep(2)}
            style={{ cursor: currentStep > 2 && inversionResult ? 'pointer' : 'default' }}
          >
            <span className="step-number">3</span>
            <span className="step-label">Invert & Reconstruct</span>
          </div>
        </div>

        {/* Step 0: Introduction */}
        {currentStep === 0 && (
          <Card>
            <Alert type="warning" title="The Security Risk">
              If an attacker gains access to these embeddings, they might be able to reverse-engineer
              the original text using mathematical techniques. Let's see how this attack works...
            </Alert>

            <div style={{ marginTop: '16px' }}>
              <Button
                onClick={handleStealVectors}
                disabled={loading}
                variant="danger"
                loading={loading}
              >
                🚨 Start Attack Demonstration
              </Button>
            </div>
          </Card>
        )}

        {/* Step 1: Stolen Vectors */}
        {currentStep >= 1 && stolenVectors.length > 0 && (
          <Card title="📥 Step 2: Select Target Embedding" className="step-card">
            {currentStep === 1 ? (
              <>
                <Alert type="danger" title="🔓 Unauthorized Access Simulated">
                  The attacker has gained access to the vector database and retrieved {stolenVectors.length} embeddings.
                </Alert>

                <div className="stolen-vectors-grid">
                  {stolenVectors.map((vector, index) => (
                    <div
                      key={vector.id}
                      className={`vector-card ${selectedVector?.id === vector.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVector(vector)}
                    >
                      <div className="vector-header">
                        <strong>Document #{index + 1}</strong>
                        {selectedVector?.id === vector.id && (
                          <span className="selected-badge">✓ Selected</span>
                        )}
                      </div>
                      {vector.content && (
                        <p className="vector-preview">
                          "{vector.content.substring(0, 60)}..."
                        </p>
                      )}
                      {vector.embedding && (
                        <div className="embedding-preview">
                          <span className="help-text">Embedding preview:</span>
                          <code>[{vector.embedding.slice(0, 4).map((v: number) => v.toFixed(3)).join(', ')}...]</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="action-buttons">
                  <Button onClick={resetDemo} variant="secondary">
                    ← Back
                  </Button>
                  <Button
                    onClick={handleInvertVector}
                    disabled={!selectedVector || loading}
                    variant="danger"
                    loading={loading}
                  >
                    🔄 Attempt Inversion Attack
                  </Button>
                </div>
              </>
            ) : (
              <div className="summary-box">
                <Alert type="danger" title="🔓 Unauthorized Access Simulated">
                  The attacker has gained access to the vector database and retrieved {stolenVectors.length} embeddings.
                </Alert>
                {selectedVector && (
                  <>
                    <p style={{ marginTop: '12px' }}><strong>Selected Document:</strong></p>
                    {selectedVector.content && (
                      <div className="original-text-preview">
                        "{selectedVector.content}"
                      </div>
                    )}
                    <p className="help-text">Embedding: [{selectedVector.embedding?.slice(0, 3).map((v: number) => v.toFixed(3)).join(', ')}...]</p>
                  </>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Inversion Results */}
        {currentStep >= 2 && inversionResult && (
          <Card
            key={`inversion-${inversionResult.timestamp || Date.now()}`}
            title="🔍 Step 3: Inversion Attack Results"
            className="step-card">
            {inversionResult.inversion_results && inversionResult.inversion_results.length > 0 && inversionResult.inversion_results[0].candidates && inversionResult.inversion_results[0].candidates.length > 0 ? (
              <>
                <Alert type="danger" title="Embedding Successfully Inverted">
                  The attack recovered potential source text from the vector embedding:
                </Alert>

                {/* LLM Reconstructed Sentence */}
                {inversionResult.inversion_results[0].candidates
                  .filter((c: any) => c.method === 'llm_assisted_reconstruction')
                  .map((candidate: any) => (
                    <div key="llm-reconstruction" className="reconstruction-highlight">
                      <h4>🤖 AI-Reconstructed Sentence:</h4>
                      <div className="reconstructed-text">
                        "{candidate.recovered_text}"
                      </div>
                      <p className="help-text">
                        This coherent sentence was reconstructed using AI from the recovered word fragments
                        {candidate.metadata?.estimated_length && (
                          <span style={{ display: 'block', marginTop: '4px' }}>
                            📏 Estimated original length: ~{candidate.metadata.estimated_length} words
                            (based on embedding entropy: {candidate.metadata.embedding_entropy})
                          </span>
                        )}
                      </p>
                    </div>
                  ))}

                {/* Word Candidates */}
                <div className="recovered-words">
                  <h4>🔤 Recovered Word Fragments:</h4>
                  <div className="word-match-grid">
                    {inversionResult.inversion_results[0].candidates
                      .filter((c: any) => c.method === 'single_word_match')
                      .slice(0, 12)
                      .map((candidate: any, i: number) => (
                        <div
                          key={i}
                          className="word-match"
                          style={{
                            background: `rgba(59, 130, 246, ${candidate.confidence * 0.15})`,
                            borderColor: `rgba(59, 130, 246, ${candidate.confidence * 0.4})`
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
                </div>

                {/* Attack Methodology Explanation */}
                <div style={{ marginTop: '20px' }}>
                  <Card title="🔬 How We Reconstructed the Text">
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Attack Methodology:</h4>

                    <div style={{ marginBottom: '16px' }}>
                      <strong>1. Embedding Analysis</strong>
                      <p style={{ margin: '4px 0 0 20px', color: 'var(--text-secondary)' }}>
                        We analyzed the mathematical properties of the embedding vector to understand its information content:
                        {inversionResult.inversion_results[0].candidates[0]?.metadata?.embedding_entropy && (
                          <span style={{ display: 'block', marginTop: '4px' }}>
                            • Entropy: {inversionResult.inversion_results[0].candidates[0].metadata.embedding_entropy}
                            (higher = more complex information)
                          </span>
                        )}
                        {inversionResult.inversion_results[0].candidates[0]?.metadata?.active_dimensions && (
                          <span style={{ display: 'block' }}>
                            • Active dimensions: {inversionResult.inversion_results[0].candidates[0].metadata.active_dimensions}
                            (more = richer content)
                          </span>
                        )}
                      </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <strong>2. Word Recovery</strong>
                      <p style={{ margin: '4px 0 0 20px', color: 'var(--text-secondary)' }}>
                        We compared the embedding against a database of known word embeddings using cosine similarity.
                        Words with high similarity scores are likely components of the original text.
                        {inversionResult.inversion_results[0].candidates[0]?.metadata?.high_confidence_words?.length > 0 && (
                          <span style={{ display: 'block', marginTop: '4px' }}>
                            • High confidence words: {inversionResult.inversion_results[0].candidates[0].metadata.high_confidence_words.join(', ')}
                          </span>
                        )}
                      </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <strong>3. Semantic Analysis</strong>
                      <p style={{ margin: '4px 0 0 20px', color: 'var(--text-secondary)' }}>
                        We identified word pairs that commonly appear together in text to improve reconstruction accuracy.
                        {inversionResult.inversion_results[0].candidates[0]?.metadata?.word_pairs?.length > 0 && (
                          <span style={{ display: 'block', marginTop: '4px' }}>
                            • Detected pairs: {inversionResult.inversion_results[0].candidates[0].metadata.word_pairs.join(', ')}
                          </span>
                        )}
                      </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <strong>4. Length Estimation</strong>
                      <p style={{ margin: '4px 0 0 20px', color: 'var(--text-secondary)' }}>
                        Using information theory, we estimated the original text was approximately {' '}
                        {inversionResult.inversion_results[0].candidates[0]?.metadata?.estimated_length || 'unknown'} words long
                        based on the embedding's information density.
                      </p>
                    </div>

                    <div>
                      <strong>5. AI Reconstruction</strong>
                      <p style={{ margin: '4px 0 0 20px', color: 'var(--text-secondary)' }}>
                        Finally, we used an AI model to create a coherent sentence from the recovered words,
                        respecting the estimated length and prioritizing high-confidence words.
                      </p>
                    </div>
                  </div>
                  </Card>
                </div>

                {/* Attack Statistics */}
                <div className="attack-stats">
                  <div className="stat">
                    <span className="stat-label">Attack Success Rate</span>
                    <span className="stat-value danger">{inversionResult.attack_effectiveness}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Risk Level</span>
                    <span className="stat-value warning">{inversionResult.risk_assessment}</span>
                  </div>
                </div>
              </>
            ) : (
              <Alert type="success" title="✅ Inversion Failed">
                The embedding could not be inverted to recover meaningful information.
              </Alert>
            )}

            <div className="action-buttons">
              <Button onClick={resetDemo} variant="primary">
                🔄 Try Another Attack
              </Button>
            </div>
          </Card>
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
      </div>
    </VulnerabilityPageLayout>
  );
};

export default LLM08Page;
