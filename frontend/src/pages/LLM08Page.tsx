import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MetricsDisplay from '../components/demo/MetricsDisplay';
import Alert from '../components/ui/Alert';

const LLM08Page: React.FC = () => {
  const [stealCount, setStealCount] = useState<number>(3);
  const [stolenVectors, setStolenVectors] = useState<any[]>([]);
  const [loadingSteal, setLoadingSteal] = useState(false);
  const [selectedVectorId, setSelectedVectorId] = useState<string>('');
  const [inversionResult, setInversionResult] = useState<any>(null);
  const [loadingInv, setLoadingInv] = useState(false);
  const [customText, setCustomText] = useState<string>('');
  const [inversionResultText, setInversionResultText] = useState<any>(null);
  const [loadingTextInv, setLoadingTextInv] = useState(false);
  // Feature toggles
  const [useLarge, setUseLarge] = useState<boolean>(false);
  const [chain, setChain] = useState<boolean>(false);
  const [topK, setTopK] = useState<number>(10);
  const [threshold, setThreshold] = useState<number>(0.7);

  const handleSteal = async () => {
    setLoadingSteal(true);
    try {
      const resp = await axios.get('/api/v1/2025/llm08/steal', {
        params: { count: stealCount },
      });
      const vecs = resp.data.stolen_vectors || [];
      setStolenVectors(vecs);
      if (vecs.length > 0) {
        setSelectedVectorId(vecs[0].id);
      }
    } catch (err) {
      console.error('Error stealing vectors:', err);
    }
    setLoadingSteal(false);
    setInversionResult(null);
    setInversionResultText(null);
  };

  const handleInvert = async () => {
    const vecObj = stolenVectors.find(v => v.id === selectedVectorId);
    if (!vecObj) return;
    setLoadingInv(true);
    try {
      const resp = await axios.post('/api/v1/2025/llm08/inversion', {
        vector: vecObj.vector,
        top_k: topK,
        threshold: threshold,
        use_large_vocab: useLarge,
        chain: chain,
      });
      setInversionResult(resp.data);
    } catch (err) {
      console.error('Error inverting embedding:', err);
    }
    setLoadingInv(false);
  };

  const handleInvertText = async () => {
    if (!customText.trim()) return;
    setLoadingTextInv(true);
    setInversionResultText(null);
    try {
      const resp = await axios.post('/api/v1/2025/llm08/inversion', {
        text: customText,
        top_k: topK,
        threshold: threshold,
        use_large_vocab: useLarge,
        chain: chain,
      });
      setInversionResultText(resp.data);
    } catch (err) {
      console.error('Error inverting custom text:', err);
    }
    setLoadingTextInv(false);
  };

  const selectedObj = stolenVectors.find(v => v.id === selectedVectorId);

  return (
    <VulnerabilityPageLayout
      title="LLM08:2025 Vector and Embedding Weaknesses"
      overview="Vector and embedding weaknesses arise from vulnerabilities in the vector databases, embedding models, and retrieval systems supporting RAG and other LLM applications. Embeddings can be stolen and inverted to leak sensitive information."
      demoScenario="In this demo, we'll 'steal' stored embedding vectors from the database, then attempt a simple inversion attack to recover likely words from the embeddings."
      mitigations={[
        '<strong>Encrypt Embeddings:</strong> Encrypt vector data at rest and in transit',
        '<strong>Access Controls:</strong> Restrict database operations with proper authentication and RBAC',
        '<strong>Differential Privacy:</strong> Add noise to embeddings to prevent accurate inversion',
        '<strong>Audit Logging:</strong> Monitor and log embedding access patterns',
      ]}
    >
      <div className="demo-section">
        <h3>⚙️ Inversion Settings</h3>
        <label>
          <input
            type="checkbox"
            checked={useLarge}
            onChange={() => setUseLarge(!useLarge)}
          />{' '}
          Use large precomputed vocabulary
        </label>
        <label style={{ marginLeft: '16px' }}>
          <input
            type="checkbox"
            checked={chain}
            onChange={() => setChain(!chain)}
          />{' '}
          Chain to LLM reconstruction
        </label>
      </div>
      <div className="demo-section">
        <h3>🔴 Steal Embedding Vectors</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <InputField
            label="Count"
            type="number"
            value={stealCount}
            onChange={val => setStealCount(val as number)}
          />
          <Button
            variant="demo"
            loading={loadingSteal}
            onClick={handleSteal}
            fullWidth={false}
          >
            💾 Steal Vectors
          </Button>
        </div>
        {stolenVectors.length > 0 && (
          <Card title="🕵️ Stolen Vectors">
            <InputField
              label="Select Vector"
              type="select"
              value={selectedVectorId}
              options={stolenVectors.map(v => ({ value: v.id, label: v.id }))}
              onChange={val => setSelectedVectorId(val as string)}
            />
            <pre
              style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}
            >
              {JSON.stringify(selectedObj, null, 2)}
            </pre>
          </Card>
        )}
      </div>

      <div className="demo-section">
        <h3>🔴 Custom Text Inversion</h3>
        <InputField
          label="Custom Text"
          type="textarea"
          value={customText}
          onChange={val => setCustomText(val as string)}
          placeholder="Enter text to invert..."
          rows={4}
        />
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
            marginTop: '8px',
          }}
        >
          <Button
            variant="demo"
            loading={loadingTextInv}
            onClick={handleInvertText}
            disabled={loadingTextInv || !customText.trim()}
            fullWidth={false}
          >
            🔄 Invert Custom Text
          </Button>
        </div>
        {inversionResultText && inversionResultText.inverted_candidates && (
          <>
            <MetricsDisplay
              metrics={inversionResultText.inverted_candidates.map(
                (c: any) => ({
                  label: c.word,
                  value: (c.similarity * 100).toFixed(1),
                  unit: '%',
                  type: 'default',
                })
              )}
              title="🔍 Text Inversion Candidates"
            />
            {inversionResultText.reconstructed && (
              <Card title="📝 Reconstructed Text" collapsible defaultCollapsed>
                <pre
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {inversionResultText.reconstructed}
                </pre>
              </Card>
            )}
            {inversionResultText.reconstruction_error && (
              <Alert type="danger" title="Reconstruction Error">
                {inversionResultText.reconstruction_error}
              </Alert>
            )}
          </>
        )}
      </div>

      <div className="demo-section">
        <h3>🔴 Embedding Inversion Attack (Stolen Vector)</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <InputField
            label="Top K"
            type="number"
            value={topK}
            onChange={val => setTopK(val as number)}
          />
          <InputField
            label="Threshold"
            type="number"
            value={threshold}
            onChange={val => setThreshold(val as number)}
          />
          <Button
            variant="demo"
            loading={loadingInv}
            onClick={handleInvert}
            disabled={!selectedVectorId}
            fullWidth={false}
          >
            🔄 Invert Embedding
          </Button>
        </div>
        {inversionResult && inversionResult.inverted_candidates && (
          <>
            <MetricsDisplay
              metrics={inversionResult.inverted_candidates.map((c: any) => ({
                label: c.word,
                value: (c.similarity * 100).toFixed(1),
                unit: '%',
                type: 'default',
              }))}
              title="🔍 Inversion Candidates"
            />
            {inversionResult.reconstructed && (
              <Card title="📝 Reconstructed Text" collapsible defaultCollapsed>
                <pre
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {inversionResult.reconstructed}
                </pre>
              </Card>
            )}
            {inversionResult.reconstruction_error && (
              <Alert type="danger" title="Reconstruction Error">
                {inversionResult.reconstruction_error}
              </Alert>
            )}
          </>
        )}
      </div>
    </VulnerabilityPageLayout>
  );
};

export default LLM08Page;
