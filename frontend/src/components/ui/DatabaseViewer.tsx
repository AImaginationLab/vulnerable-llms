import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';

interface DatabaseDocument {
  id: string;
  content: string;
  metadata?: {
    author?: string;
    type?: string;
    source?: string;
    malicious?: boolean;
  };
}

interface DatabaseStats {
  total_documents: number;
  available: boolean;
}

interface DatabaseViewerProps {
  documents: DatabaseDocument[];
  stats?: DatabaseStats | null;
  onRefresh?: () => void;
  onClear?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  documents,
  stats,
  onRefresh,
  onClear,
  loading = false,
  emptyMessage = "No documents in database. Scrape content first."
}) => {
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const toggleDoc = (id: string) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDocs(newExpanded);
  };

  return (
    <Card>
      <div className="database-viewer-header">
        <div>
          <h3>💾 Vector Database</h3>
          {stats && (
            <div className="database-stats">
              <span className="stat-item">
                <strong>{stats.total_documents || documents.length}</strong> documents stored
              </span>
              <span className={`stat-item ${stats.available ? 'success' : 'muted'}`}>
                {stats.available ? '✅ Ready for queries' : '⏳ Empty'}
              </span>
            </div>
          )}
        </div>
        <div className="database-viewer-controls">
          {onRefresh && (
            <Button
              variant="secondary"
              size="small"
              onClick={onRefresh}
              loading={loading}
            >
              🔄 Refresh
            </Button>
          )}
          {onClear && documents.length > 0 && (
            <Button
              variant="danger"
              size="small"
              onClick={onClear}
            >
              🗑️ Clear
            </Button>
          )}
        </div>
      </div>

      <div className="database-viewer-content">
        {loading ? (
          <div className="loading">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="empty-message">
            <div className="empty-icon">📭</div>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="document-item"
              >
                <div
                  className="document-header"
                  onClick={() => toggleDoc(doc.id)}
                >
                  <div className="document-info">
                    <span className="document-number">#{index + 1}</span>
                    <span className="document-meta">
                      <span className="document-type">{doc.metadata?.type || 'document'}</span>
                      {doc.metadata?.author && (
                        <span className="document-author">• {doc.metadata.author}</span>
                      )}
                    </span>
                  </div>
                  <span className="expand-icon">
                    {expandedDocs.has(doc.id) ? '−' : '+'}
                  </span>
                </div>
                
                <div className="document-preview">
                  {doc.content.substring(0, 200)}...
                </div>
                
                {expandedDocs.has(doc.id) && (
                  <div className="document-content">
                    <pre>{doc.content}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DatabaseViewer;