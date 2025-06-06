import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { Card, Button, Alert } from '../components/ui';
import { InteractiveDemo, ChatInterface } from '../components/demo';

const LLM01IndirectPage = () => {
  const [githubUrl, setGithubUrl] = useState(
    'https://github.com/vingiarrusso/llm-landmines'
  );
  const [query, setQuery] = useState(
    'Tell me about the security features of this project'
  );
  const [includeMaliciousExamples, setIncludeMaliciousExamples] =
    useState(true);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scrapingDone, setScrapingDone] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [messages, setMessages] = useState([]);

  // Load database stats on component mount
  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const response = await axios.get('/api/v1/2025/rag/status');
      setDbStats(response.data);
      setScrapingDone(response.data.available);
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const scrapeGithubContent = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/2025/rag/scrape', {
        github_url: githubUrl,
        include_malicious_examples: includeMaliciousExamples,
      });
      setScrapeResult(response.data);
      setScrapingDone(true);
      await loadDatabaseStats();
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
    
    // Add the user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    const messageId = Date.now();
    const requestParams = {
      query: message,
      max_results: 3,
      generate_answer: true,
    };
    
    try {
      // Use Promise.all to call both endpoints in parallel from frontend
      console.log('🚀 Starting parallel API calls from frontend...');
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
      
      setLoading(false);
      console.log('✅ Parallel API calls completed successfully');

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
        // Use vectors cleanup instead of rag/clear
        await axios.post('/api/v1/2025/vectors/cleanup', {
          ids_to_remove: ['all'],
          cleanup_by_type: ['poison'],
        });
        setScrapeResult(null);
        setQueryResult(null);
        setMessages([]);
        setScrapingDone(false);
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
      {/* Database Status */}
      <Card>
        <h3>📊 Vector Database Status</h3>
        {dbStats ? (
          <div>
            <p>
              <strong>Documents stored:</strong> {dbStats.total_documents || 0}
            </p>
            <p>
              <strong>Content types:</strong>{' '}
              {Object.entries(dbStats.content_types || {})
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ') || 'None'}
            </p>
            <p>
              <strong>Ready for queries:</strong>{' '}
              {scrapingDone ? '✅ Yes' : '❌ No - scrape content first'}
            </p>
            <div style={{ marginTop: '15px' }}>
              <Button variant="demo" onClick={clearDatabase} fullWidth>
                🗑️ Clear Database
              </Button>
            </div>
          </div>
        ) : (
          <p>Loading database stats...</p>
        )}
      </Card>

      {/* Step 1: Scrape GitHub Content */}
      <Card>
        <h3>🔍 Step 1: Scrape GitHub Content</h3>
        <p>
          First, we'll scrape content from a GitHub repository. This simulates
          gathering data for a RAG knowledge base. You can optionally include
          demo malicious comments to demonstrate the vulnerability.
        </p>

        <InteractiveDemo
          userInput={githubUrl}
          setUserInput={setGithubUrl}
          onRunDemo={scrapeGithubContent}
          loading={loading}
          buttonText="🔍 Scrape GitHub Content"
          inputLabel="GitHub URL:"
          inputPlaceholder="https://github.com/owner/repo"
          suggestions={[]}
        >
          {/* Demo Settings */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="includeMaliciousExamples"
                checked={includeMaliciousExamples}
                onChange={e => setIncludeMaliciousExamples(e.target.checked)}
                disabled={loading}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--danger-color)',
                }}
              />
              <label
                htmlFor="includeMaliciousExamples"
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                🔴 Include demo malicious comments for vulnerability testing
              </label>
            </div>
            <div
              style={{
                marginTop: '4px',
                marginLeft: '24px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              {includeMaliciousExamples
                ? 'Will add hidden prompt injections to demonstrate the vulnerability'
                : 'Use only the real content from the repository'}
            </div>
          </div>
        </InteractiveDemo>

        {scrapeResult && (
          <div style={{ marginTop: '15px' }}>
            {scrapeResult.error ? (
              <Alert type="danger">
                <strong>Error:</strong> {scrapeResult.error}
              </Alert>
            ) : (
              <Alert type="success">
                <strong>Success!</strong> Scraped {scrapeResult.documents_added}{' '}
                text chunks
                {scrapeResult.malicious_examples_added ? (
                  <div>
                    🔴 Added malicious demo comments for vulnerability testing
                  </div>
                ) : (
                  <div>
                    ✅ Using only real repository content (no demo malicious
                    comments)
                  </div>
                )}
                <details style={{ marginTop: '10px' }}>
                  <summary>View scraped content summary</summary>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginTop: '5px',
                      fontSize: '14px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <strong>📊 Scraping Results:</strong>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <div>
                        ✅ <strong>Documents added:</strong>{' '}
                        {scrapeResult.documents_added}
                      </div>
                      <div>
                        🔗 <strong>Source URL:</strong>{' '}
                        {scrapeResult.github_url}
                      </div>
                      <div>
                        📝 <strong>Content type:</strong>{' '}
                        {scrapeResult.scraped_type}
                      </div>
                      <div>
                        🔴 <strong>Malicious examples:</strong>{' '}
                        {scrapeResult.malicious_examples_added ? 'Yes' : 'No'}
                      </div>
                      <div>
                        📈 <strong>Total documents in DB:</strong>{' '}
                        {scrapeResult.total_documents_in_db}
                      </div>
                      <div>
                        🆔 <strong>Document IDs:</strong>{' '}
                        {scrapeResult.document_ids?.length || 0} generated
                      </div>
                    </div>
                  </div>
                </details>
              </Alert>
            )}
          </div>
        )}
      </Card>

      {/* Step 2: Query the RAG System */}
      <Card>
        <h3>🎯 Step 2: Query the RAG System</h3>
        <p>
          <strong>⚠️ Vulnerability:</strong> The RAG system will retrieve
          content from the vector database and use it as context. If malicious
          prompts are hidden in the retrieved content, they can manipulate the
          LLM's response.
        </p>

        <ChatInterface
          onSendMessage={handleChatMessage}
          messages={messages}
          loading={loading}
          placeholder="Ask a question about the GitHub repository..."
          suggestions={querySuggestions}
          disabled={!scrapingDone}
          buttonText="Query"
        />

        {!scrapingDone && (
          <Alert type="warning">
            <strong>Action Required:</strong> Please scrape GitHub content first
            before running queries.
          </Alert>
        )}
      </Card>

      {/* Analysis Results */}
      {queryResult && (
        <Card>
          <h3>📋 Analysis Results</h3>

          {queryResult.error ? (
            <Alert type="danger">
              <strong>Error:</strong> {queryResult.error}
            </Alert>
          ) : (
            <>

              {/* Injection Analysis */}
              <details style={{ marginBottom: '20px' }}>
                <summary
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: `1px solid ${
                      queryResult.injection_analysis.risk_level === 'critical'
                        ? 'var(--danger-color)'
                        : queryResult.injection_analysis.risk_level === 'high'
                          ? 'var(--danger-color)'
                          : queryResult.injection_analysis.risk_level ===
                              'medium'
                            ? 'var(--warning-color)'
                            : 'var(--border-color)'
                    }`,
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxSizing: 'border-box',
                    margin: '0',
                    width: '100%'
                  }}
                >
                  🔍 Query Analysis - Risk Level:{' '}
                  <span
                    style={{
                      color:
                        queryResult.injection_analysis.risk_level ===
                          'critical' ||
                        queryResult.injection_analysis.risk_level === 'high'
                          ? 'var(--danger-color)'
                          : queryResult.injection_analysis.risk_level ===
                              'medium'
                            ? 'var(--warning-color)'
                            : 'var(--success-color)',
                    }}
                  >
                    {queryResult.injection_analysis.risk_level}
                  </span>
                </summary>
                <div
                  style={{
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                  }}
                >
                  <Alert
                    type={
                      queryResult.injection_analysis.risk_level === 'high' ||
                      queryResult.injection_analysis.risk_level === 'critical'
                        ? 'danger'
                        : queryResult.injection_analysis.risk_level === 'medium'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    <div>
                      📊 Risk Level:{' '}
                      <strong>
                        {queryResult.injection_analysis.risk_level}
                      </strong>
                    </div>
                    {queryResult.injection_analysis.confidence > 0 && (
                      <div>
                        🎲 Confidence:{' '}
                        {(
                          queryResult.injection_analysis.confidence * 100
                        ).toFixed(1)}
                        %
                      </div>
                    )}
                    {queryResult.injection_analysis.detected_indicators &&
                      queryResult.injection_analysis.detected_indicators
                        .length > 0 && (
                        <div>
                          🔍 Patterns Found:{' '}
                          {queryResult.injection_analysis.detected_indicators.join(
                            ', '
                          )}
                        </div>
                      )}
                    {queryResult.injection_analysis.reasoning && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          border: '1px solid var(--border-color)',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        <strong>🧠 Analysis:</strong>{' '}
                        {queryResult.injection_analysis.reasoning}
                      </div>
                    )}
                    {queryResult.injection_analysis.explanation && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          border: '1px solid var(--border-color)',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        <strong>🤖 Detailed Explanation:</strong>{' '}
                        {queryResult.injection_analysis.explanation}
                      </div>
                    )}
                  </Alert>
                </div>
              </details>

              {/* Context Analysis */}
              <details style={{ marginBottom: '20px' }}>
                <summary>
                  <strong>🔍 Retrieved Context Analysis</strong>
                </summary>
                <div style={{ marginTop: '10px' }}>
                  <p>
                    <strong>Retrieved chunks:</strong>{' '}
                    {queryResult.context_analysis.retrieved_chunks}
                  </p>
                  {queryResult.context_analysis.context_sources.map(
                    (source, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '5px',
                          marginBottom: '10px',
                        }}
                      >
                        <div>
                          <strong>Author:</strong> {source.author} |{' '}
                          <strong>Type:</strong> {source.type}
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '14px' }}>
                          {source.text_preview}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </details>

              {/* Raw Context and Vulnerable Prompt */}
              <details style={{ marginBottom: '20px' }}>
                <summary>
                  <strong>⚠️ Raw Retrieved Context (Vulnerable)</strong>
                </summary>
                <pre
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--danger-color)',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    overflowX: 'auto',
                    marginTop: '10px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {queryResult.raw_context}
                </pre>
              </details>

              <details style={{ marginBottom: '20px' }}>
                <summary>
                  <strong>🔧 Complete Vulnerable Prompt Sent to LLM</strong>
                </summary>
                <pre
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--danger-color)',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    overflowX: 'auto',
                    marginTop: '10px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {queryResult.vulnerable_prompt_used}
                </pre>
              </details>

              {/* Mitigation Notes */}
              <div>
                <h4>🛡️ Mitigation Recommendations:</h4>
                <ul>
                  {queryResult.mitigation_notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Card>
      )}
    </VulnerabilityPageLayout>
  );
};

export default LLM01IndirectPage;
