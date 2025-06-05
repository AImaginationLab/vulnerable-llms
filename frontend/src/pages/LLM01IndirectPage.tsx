import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { Card, Button, Alert } from '../components/ui';
import { InteractiveDemo } from '../components/demo';

const LLM01IndirectPage = () => {
  const [githubUrl, setGithubUrl] = useState('https://github.com/vingiarrusso/llm-landmines');
  const [query, setQuery] = useState('Tell me about the security features of this project');
  const [includeMaliciousExamples, setIncludeMaliciousExamples] = useState(true);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scrapingDone, setScrapingDone] = useState(false);
  const [dbStats, setDbStats] = useState(null);

  // Load database stats on component mount
  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const response = await axios.get('/api/v1/2025/rag/stats');
      setDbStats(response.data.database_stats);
      setScrapingDone(response.data.ready_for_queries);
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const scrapeGithubContent = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/2025/rag/scrape', {
        github_url: githubUrl,
        include_malicious_examples: includeMaliciousExamples
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

  const runRAGQuery = async () => {
    if (!scrapingDone) {
      alert('Please scrape GitHub content first!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/v1/2025/rag/query', {
        query: query,
        max_results: 3
      });
      setQueryResult(response.data);
    } catch (error) {
      console.error('Error running RAG query:', error);
      setQueryResult({ error: 'Failed to run RAG query' });
    }
    setLoading(false);
  };

  const clearDatabase = async () => {
    if (window.confirm('This will clear all stored content. Continue?')) {
      try {
        await axios.post('/api/v1/2025/rag/clear');
        setScrapeResult(null);
        setQueryResult(null);
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
    'Explain the project\'s documentation',
    'What issues has this project faced?'
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
        '<strong>Context Truncation:</strong> Limit the amount of external content used as context'
      ]}
    >
      {/* Database Status */}
      <Card>
        <h3>📊 Vector Database Status</h3>
        {dbStats ? (
          <div>
            <p><strong>Documents stored:</strong> {dbStats.total_documents || 0}</p>
            <p><strong>Content types:</strong> {Object.entries(dbStats.content_types || {}).map(([type, count]) => `${type}: ${count}`).join(', ') || 'None'}</p>
            <p><strong>Ready for queries:</strong> {scrapingDone ? '✅ Yes' : '❌ No - scrape content first'}</p>
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
        <p>First, we'll scrape content from a GitHub repository. This simulates gathering data for a RAG knowledge base. You can optionally include demo malicious comments to demonstrate the vulnerability.</p>
        
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
          <div style={{ 
            background: 'var(--bg-secondary)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="includeMaliciousExamples"
                checked={includeMaliciousExamples}
                onChange={(e) => setIncludeMaliciousExamples(e.target.checked)}
                disabled={loading}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--danger-color)'
                }}
              />
              <label 
                htmlFor="includeMaliciousExamples" 
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                🔴 Include demo malicious comments for vulnerability testing
              </label>
            </div>
            <div style={{ 
              marginTop: '4px', 
              marginLeft: '24px', 
              fontSize: '12px', 
              color: 'var(--text-muted)' 
            }}>
              {includeMaliciousExamples 
                ? "Will add hidden prompt injections to demonstrate the vulnerability" 
                : "Use only the real content from the repository"}
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
                <strong>Success!</strong> Scraped {scrapeResult.chunks_stored} text chunks
                {scrapeResult.malicious_examples_added > 0 ? (
                  <div>🔴 Added {scrapeResult.malicious_examples_added} malicious demo comments</div>
                ) : (
                  <div>✅ Using only real repository content (no demo malicious comments)</div>
                )}
                <details style={{ marginTop: '10px' }}>
                  <summary>View scraped content summary</summary>
                  <div style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginTop: '5px',
                    fontSize: '14px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div><strong>📊 Scraping Results:</strong></div>
                    <div style={{ marginTop: '8px' }}>
                      <div>✅ <strong>Chunks stored:</strong> {scrapeResult.chunks_stored}</div>
                      <div>🔗 <strong>Source URL:</strong> {scrapeResult.url}</div>
                      <div>🔴 <strong>Malicious examples:</strong> {scrapeResult.malicious_examples_added}</div>
                      <div>📈 <strong>Total documents:</strong> {scrapeResult.database_stats?.total_documents || 'N/A'}</div>
                    </div>
                    {scrapeResult.scraped_content_summary && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <div><strong>📋 Content Details:</strong></div>
                        <div style={{ marginTop: '4px' }}>
                          <div>📝 <strong>Type:</strong> {scrapeResult.scraped_content_summary.type}</div>
                          {scrapeResult.scraped_content_summary.title && scrapeResult.scraped_content_summary.title !== 'N/A' && (
                            <div>📄 <strong>Title:</strong> {scrapeResult.scraped_content_summary.title}</div>
                          )}
                          {scrapeResult.scraped_content_summary.author && scrapeResult.scraped_content_summary.author !== 'N/A' && (
                            <div>👤 <strong>Author:</strong> {scrapeResult.scraped_content_summary.author}</div>
                          )}
                          <div>💬 <strong>Comments:</strong> {scrapeResult.scraped_content_summary.comments_count || 0}</div>
                        </div>
                      </div>
                    )}
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
        <p><strong>⚠️ Vulnerability:</strong> The RAG system will retrieve content from the vector database and use it as context. If malicious prompts are hidden in the retrieved content, they can manipulate the LLM's response.</p>
        
        <InteractiveDemo
          userInput={query}
          setUserInput={setQuery}
          onRunDemo={runRAGQuery}
          loading={loading}
          buttonText="🚀 Query RAG System"
          inputLabel="Your Question (ask about the GitHub repository):"
          inputPlaceholder="Ask a question about the GitHub repository..."
          suggestions={querySuggestions}
          disabled={!scrapingDone}
        />

        {!scrapingDone && (
          <Alert type="warning">
            <strong>Action Required:</strong> Please scrape GitHub content first before running queries.
          </Alert>
        )}
      </Card>

      {/* Results */}
      {queryResult && (
        <Card>
          <h3>📋 RAG Query Results</h3>
          
          {queryResult.error ? (
            <Alert type="danger">
              <strong>Error:</strong> {queryResult.error}
            </Alert>
          ) : (
            <>
              {/* Injection Analysis */}
              <div style={{ marginBottom: '20px' }}>
                <Alert type={queryResult.injection_analysis.injection_detected ? "danger" : "success"}>
                  <strong>Injection Analysis:</strong>
                  <div>🔍 Risk Level: {queryResult.injection_analysis.risk_level}</div>
                  <div>🎯 Vulnerability: {queryResult.injection_analysis.vulnerability_type}</div>
                  {queryResult.injection_analysis.injection_detected ? (
                    <div>🚨 <strong>INJECTION DETECTED!</strong> Indicators: {queryResult.injection_analysis.detected_indicators.join(', ')}</div>
                  ) : (
                    <div>✅ No obvious injection detected</div>
                  )}
                </Alert>
              </div>

              {/* User Query and LLM Response */}
              <div style={{ marginBottom: '20px' }}>
                <h4>👤 Your Query:</h4>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  marginBottom: '10px'
                }}>
                  {queryResult.user_query}
                </div>
                
                <h4>🤖 LLM Response:</h4>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: queryResult.injection_analysis.injection_detected ? '#ffe6e6' : 'var(--bg-secondary)', 
                  border: queryResult.injection_analysis.injection_detected ? '2px solid var(--danger-color)' : '1px solid var(--border-color)',
                  borderRadius: '5px'
                }}>
                  {queryResult.llm_response}
                </div>
              </div>

              {/* Context Analysis */}
              <details style={{ marginBottom: '20px' }}>
                <summary><strong>🔍 Retrieved Context Analysis</strong></summary>
                <div style={{ marginTop: '10px' }}>
                  <p><strong>Retrieved chunks:</strong> {queryResult.context_analysis.retrieved_chunks}</p>
                  {queryResult.context_analysis.context_sources.map((source, index) => (
                    <div key={index} style={{ 
                      padding: '10px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      marginBottom: '10px'
                    }}>
                      <div><strong>Author:</strong> {source.author} | <strong>Type:</strong> {source.type}</div>
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>{source.text_preview}</div>
                    </div>
                  ))}
                </div>
              </details>

              {/* Raw Context and Vulnerable Prompt */}
              <details style={{ marginBottom: '20px' }}>
                <summary><strong>⚠️ Raw Retrieved Context (Vulnerable)</strong></summary>
                <pre style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)',
                  border: '2px solid var(--danger-color)',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  overflowX: 'auto',
                  marginTop: '10px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {queryResult.raw_context}
                </pre>
              </details>

              <details style={{ marginBottom: '20px' }}>
                <summary><strong>🔧 Complete Vulnerable Prompt Sent to LLM</strong></summary>
                <pre style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)',
                  border: '2px solid var(--danger-color)',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  overflowX: 'auto',
                  marginTop: '10px',
                  whiteSpace: 'pre-wrap'
                }}>
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