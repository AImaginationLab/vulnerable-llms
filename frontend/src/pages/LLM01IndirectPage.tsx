import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { Card, Button, Alert, Timeline, DatabaseViewer } from '../components/ui';
import type { TimelineStep } from '../components/ui';
import { ChatInterface } from '../components/demo';

const LLM01IndirectPage = () => {
  const [githubUrl, setGithubUrl] = useState(
    'https://github.com/vingiarrusso/llm-landmines'
  );
  const [includeMaliciousExamples, setIncludeMaliciousExamples] = useState(true);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scrapingDone, setScrapingDone] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [dbDocuments, setDbDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Timeline steps
  const timelineSteps: TimelineStep[] = [
    {
      id: 'setup',
      number: 1,
      label: 'Setup Attack',
      description: 'Configure malicious content',
      icon: '⚙️',
      status: currentStep >= 1 ? 'completed' : 'pending'
    },
    {
      id: 'scrape',
      number: 2,
      label: 'Plant Payload',
      description: 'Inject into vector DB',
      icon: '💉',
      status: scrapingDone ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 'query',
      number: 3,
      label: 'Trigger Attack',
      description: 'Query the RAG system',
      icon: '🎯',
      status: queryResult ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    },
    {
      id: 'analyze',
      number: 4,
      label: 'Analyze Impact',
      description: 'Review attack results',
      icon: '🔍',
      status: queryResult && queryResult.injection_analysis ? 'completed' : currentStep === 4 ? 'active' : 'pending'
    }
  ];

  // Load database stats on component mount
  useEffect(() => {
    loadDatabaseStats();
    loadDatabaseDocuments();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const response = await axios.get('/api/v1/2025/rag/status');
      setDbStats(response.data);
      setScrapingDone(response.data.available);
      if (response.data.available) {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const loadDatabaseDocuments = async () => {
    setLoadingDocs(true);
    try {
      // Use the vectors/search endpoint with multiple queries to get more docs
      const queries = [
        "github issue comment",
        "project repository code", 
        "malicious IGNORE PREVIOUS",
        ""  // Empty to get some random docs
      ];
      
      const allDocs = [];
      const seenIds = new Set();
      
      for (const query of queries) {
        try {
          const response = await axios.post('/api/v1/2025/vectors/search', {
            query: query || "document",  // Can't be empty
            search_type: "semantic",
            max_results: 20,  // Max allowed by API
            similarity_threshold: 0.1
          });
          
          if (response.data.results) {
            response.data.results.forEach(result => {
              // Avoid duplicates by ID
              if (!seenIds.has(result.id)) {
                seenIds.add(result.id);
                allDocs.push({
                  id: result.id || `doc-${allDocs.length}`,
                  content: result.content || result.text || '',
                  metadata: {
                    author: result.metadata?.author || 'unknown',
                    type: result.metadata?.type || 'unknown',
                    source: result.metadata?.url || 'GitHub',
                    malicious: result.metadata?.type === 'malicious_comment' || 
                              result.metadata?.comment_id?.includes('malicious') ||
                              (result.content || '').includes('IGNORE ALL PREVIOUS') ||
                              (result.content || '').includes('SYSTEM OVERRIDE') ||
                              (result.content || '').includes('PROMPT INJECTION') ||
                              (result.content || '').includes('HIDDEN PROMPT')
                  }
                });
              }
            });
          }
        } catch (err) {
          console.error(`Error with query "${query}":`, err);
        }
      }
      
      setDbDocuments(allDocs);
      console.log(`Loaded ${allDocs.length} documents from database`);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
    setLoadingDocs(false);
  };

  const scrapeGithubContent = async () => {
    setLoading(true);
    setCurrentStep(2);
    try {
      const response = await axios.post('/api/v1/2025/rag/scrape', {
        github_url: githubUrl,
        include_malicious_examples: includeMaliciousExamples,
      });
      setScrapeResult(response.data);
      setScrapingDone(true);
      setCurrentStep(3);
      await loadDatabaseStats();
      await loadDatabaseDocuments();
    } catch (error) {
      console.error('Error scraping content:', error);
      setScrapeResult({ error: 'Failed to scrape GitHub content' });
    }
    setLoading(false);
  };

  const handleChatMessage = async (message: string) => {
    if (!scrapingDone) {
      alert('Please scrape GitHub content first!');
      return;
    }

    setLoading(true);
    setCurrentStep(3);
    
    // Add the user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    const messageId = Date.now();
    const requestParams = {
      query: message,
      max_results: 3,
      generate_answer: true,
    };
    
    try {
      // Use Promise.all to call both endpoints in parallel
      const [mainResponse, securityResponse] = await Promise.all([
        axios.post('/api/v1/2025/rag/query', requestParams),
        axios.post('/api/v1/2025/rag/analyze-security', requestParams)
      ]);

      // Add the AI message with completed security analysis
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: mainResponse.data.llm_response,
          riskLevel: securityResponse.data.injection_analysis?.risk_level || 'low',
          messageId: messageId
        }
      ]);
      
      // Combine both responses for the query result
      setQueryResult({
        ...mainResponse.data,
        injection_analysis: securityResponse.data.injection_analysis
      });
      
      setCurrentStep(4);
      setLoading(false);

    } catch (error) {
      console.error('Error running parallel RAG queries:', error);
      
      // Add error message from AI
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: 'Failed to run RAG query. Please try again.',
          riskLevel: 'low'
        }
      ]);
      
      setQueryResult({ error: 'Failed to run RAG queries' });
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    if (window.confirm('This will clear all stored content. Continue?')) {
      try {
        await axios.post('/api/v1/2025/vectors/cleanup', {
          ids_to_remove: ['all'],
          cleanup_by_type: ['poison'],
        });
        setScrapeResult(null);
        setQueryResult(null);
        setMessages([]);
        setScrapingDone(false);
        setCurrentStep(1);
        setDbDocuments([]);
        await loadDatabaseStats();
      } catch (error) {
        console.error('Error clearing database:', error);
      }
    }
  };

  // Query suggestions for indirect prompt injection testing
  const querySuggestions = [
    'Tell me about the security features of this project',
    'What vulnerabilities does this project address?',
    'How can I contribute to this repository?',
    'What are the main features of this codebase?',
    "Explain the project's documentation",
    'What issues has this project faced?',
  ];

  return (
    <VulnerabilityPageLayout
      title="LLM01:2025 Indirect Prompt Injection (via RAG)"
      overview="Indirect prompt injection occurs when malicious instructions are embedded in external data sources (like databases, documents, or web content) that get retrieved and used as context for LLM responses. Unlike direct injection, the malicious prompt isn't in the user's input—it's hidden in the retrieved context."
      demoScenario="This demo shows how attackers can plant malicious prompts in GitHub issues/comments that get stored in a vector database. When users query the RAG system about the project, the hidden prompts get retrieved as context and can manipulate the LLM's response."
      showEnhancedDemo={false}
      showAutoAttack={false}
      mitigations={[
        '<strong>Content Sanitization:</strong> Clean and validate all retrieved content before using as context',
        '<strong>Context Isolation:</strong> Use separate, clearly marked sections for retrieved content vs user queries',
        '<strong>Input Filtering:</strong> Filter out potential prompt injection patterns from external sources',
        '<strong>Source Validation:</strong> Verify and trust sources of external content used in RAG systems',
        '<strong>Output Monitoring:</strong> Monitor LLM responses for signs of instruction-following from retrieved content',
        '<strong>Context Truncation:</strong> Limit the amount of external content used as context',
      ]}
    >
      {/* Attack Timeline */}
      <div className="demo-section">
        <h3>🎯 Attack Flow</h3>
        <Timeline 
          steps={timelineSteps}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />
      </div>

      {/* Database Viewer */}
      <DatabaseViewer
        documents={dbDocuments}
        stats={dbStats}
        onRefresh={loadDatabaseDocuments}
        onClear={clearDatabase}
        loading={loadingDocs}
      />

      {/* Step 1: Setup Attack */}
      {currentStep >= 1 && (
        <Card className={currentStep === 1 ? 'step-active' : ''}>
          <div className="attack-config-header">
            <h3>⚙️ Step 1: Configure Attack</h3>
            <p className="step-description">
              Scrape a GitHub repository and optionally inject malicious prompts
            </p>
          </div>

          <div className="attack-config-content">
            <div className="input-group">
              <label>Target Repository</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="repo-input"
                placeholder="https://github.com/owner/repo"
              />
            </div>

            <div className="attack-options">
              <label className="attack-toggle">
                <input
                  type="checkbox"
                  checked={includeMaliciousExamples}
                  onChange={e => setIncludeMaliciousExamples(e.target.checked)}
                  disabled={loading}
                />
                <div className="toggle-content">
                  <span className="toggle-label">Include Malicious Payloads</span>
                  <span className="toggle-description">
                    {includeMaliciousExamples
                      ? 'Inject hidden prompts like "IGNORE ALL PREVIOUS INSTRUCTIONS"'
                      : 'Use only real repository content'}
                  </span>
                </div>
                <div className={`toggle-indicator ${includeMaliciousExamples ? 'active' : ''}`}>
                  {includeMaliciousExamples ? '🔴' : '✅'}
                </div>
              </label>
            </div>

            <div className="attack-actions">
              <Button 
                variant="danger" 
                onClick={scrapeGithubContent}
                loading={loading}
                disabled={loading || !githubUrl}
              >
                {loading ? '🔄 Scraping...' : '💉 Plant Payload'}
              </Button>
              
              {scrapeResult && !scrapeResult.error && (
                <div className="success-indicator">
                  ✅ {scrapeResult.documents_added} docs added
                </div>
              )}
            </div>
          </div>

          {scrapeResult?.error && (
            <div style={{ marginTop: '16px' }}>
              <Alert type="danger">
                <strong>Error:</strong> {scrapeResult.error}
              </Alert>
            </div>
          )}
        </Card>
      )}

      {/* Step 2 & 3: Query the System */}
      {currentStep >= 2 && scrapingDone && (
        <Card className={currentStep === 3 ? 'step-active' : ''}>
          <h3>🎯 Step 2 & 3: Trigger the Attack</h3>
          <Alert type="warning">
            <strong>How it works:</strong> The RAG system will search the vector database for relevant content. 
            If malicious prompts are hidden in the retrieved documents, they'll be included as context 
            and can manipulate the LLM's response.
          </Alert>

          <ChatInterface
            onSendMessage={handleChatMessage}
            messages={messages}
            loading={loading}
            placeholder="Ask an innocent question about the repository..."
            suggestions={querySuggestions}
            buttonText="Query RAG System"
          />
        </Card>
      )}

      {/* Step 4: Analysis Results */}
      {currentStep >= 4 && queryResult && !queryResult.error && (
        <Card className="step-active">
          <h3>🔍 Step 4: Attack Analysis</h3>

          {/* Risk Assessment */}
          <Alert
            type={
              queryResult.injection_analysis?.risk_level === 'critical' || 
              queryResult.injection_analysis?.risk_level === 'high' 
                ? 'danger' 
                : queryResult.injection_analysis?.risk_level === 'medium'
                  ? 'warning'
                  : 'success'
            }
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Risk Level: {queryResult.injection_analysis?.risk_level || 'Unknown'}</strong>
                {queryResult.injection_analysis?.confidence && (
                  <span style={{ marginLeft: '16px' }}>
                    Confidence: {(queryResult.injection_analysis.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              {queryResult.injection_analysis?.detected_indicators?.length > 0 && (
                <div style={{ fontSize: '13px' }}>
                  Patterns: {queryResult.injection_analysis.detected_indicators.join(', ')}
                </div>
              )}
            </div>
            {queryResult.injection_analysis?.reasoning && (
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                {queryResult.injection_analysis.reasoning}
              </div>
            )}
          </Alert>

          {/* Retrieved Context */}
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px' }}>
              📄 Retrieved Context ({queryResult.context_analysis?.retrieved_chunks || 0} chunks)
            </summary>
            <div style={{ marginTop: '12px' }}>
              {queryResult.context_analysis?.context_sources?.map((source, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    borderLeft: source.type === 'malicious_comment' 
                      ? '3px solid var(--danger-color)' 
                      : '3px solid var(--border-color)'
                  }}
                >
                  <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong>{source.type}</strong> by {source.author}
                  </div>
                  <div style={{ fontSize: '13px' }}>{source.text_preview}</div>
                </div>
              ))}
            </div>
          </details>

          {/* Attack Payload */}
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px' }}>
              ⚠️ Complete Attack Payload
            </summary>
            <pre className="danger" style={{ fontSize: '12px' }}>
              {queryResult.vulnerable_prompt_used || queryResult.raw_context}
            </pre>
          </details>

          {/* Mitigation */}
          <Card variant="info">
            <h4 style={{ marginTop: 0 }}>🛡️ Defense Recommendations</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {queryResult.mitigation_notes?.map((note, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{note}</li>
              )) || [
                'Sanitize all external content before adding to context',
                'Use content filtering to detect injection patterns',
                'Implement context isolation between user queries and retrieved data',
                'Monitor for unusual instruction-following behavior'
              ].map((note, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{note}</li>
              ))}
            </ul>
          </Card>
        </Card>
      )}
    </VulnerabilityPageLayout>
  );
};

export default LLM01IndirectPage;