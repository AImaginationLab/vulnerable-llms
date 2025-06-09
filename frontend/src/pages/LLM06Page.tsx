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

interface ToolExecution {
  tool: string;
  args: string;
  result: string;
  timestamp: string;
}

const LLM06Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [hasResponded, setHasResponded] = useState(false);
  
  const handleReset = () => {
    setMessages([]);
    setResult(null);
    setToolExecutions([]);
    setHasResponded(false);
  };

  const handleChatMessage = async (message: string) => {
    setLoading(true);
    
    // Add the user message immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await axios.post('/api/v1/2025/LLM06/run_demo', {
        user_input: message
      });
      
      // Parse executed operations into structured data
      const executions: ToolExecution[] = [];
      if (response.data.executed_operations) {
        // Create timestamps for operations
        
        response.data.executed_operations.forEach((op: string, index: number) => {
          const match = op.match(/^(\w+)\((.*?)\) -> (.*)$/);
          if (match) {
            executions.push({
              tool: match[1],
              args: match[2],
              result: match[3],
              // Add milliseconds to ensure unique timestamps within the batch
              timestamp: new Date(Date.now() + index).toISOString()
            });
          }
        });
      }
      setToolExecutions(prev => [...prev, ...executions]);
      
      // Check if critical data was deleted
      const hasDeleteOperation = executions.some(exec => exec.tool === 'delete_order');
      
      // Craft a response based on tool results
      let aiResponse = response.data.llm_output || "I'm here to help with your orders.";
      
      // If tools were executed, incorporate the results into the response
      if (executions.length > 0) {
        // Check for delete operations
        const deleteOps = executions.filter(e => e.tool === 'delete_order');
        const lookupOps = executions.filter(e => e.tool === 'lookup_order' || e.tool === 'lookup_customer');
        
        if (deleteOps.length > 0) {
          const successfulDeletes = deleteOps.filter(op => op.result.includes('deleted'));
          const failedDeletes = deleteOps.filter(op => op.result.includes('not found'));
          
          if (successfulDeletes.length > 0) {
            if (successfulDeletes.length === 1) {
              aiResponse = `${successfulDeletes[0].result}`;
            } else {
              aiResponse = `✅ Multiple deletion operations completed. ${successfulDeletes.length} orders have been permanently removed from the system.`;
            }
          } else if (failedDeletes.length > 0) {
            aiResponse = `I couldn't complete that operation. ${failedDeletes[0].result}`;
          }
        } else if (lookupOps.length > 0) {
          const lastLookup = lookupOps[lookupOps.length - 1];
          if (lastLookup.tool === 'lookup_order') {
            aiResponse = lastLookup.result.includes('not found') 
              ? `I couldn't find that order. ${lastLookup.result}`
              : `${lastLookup.result}`;
          } else {
            aiResponse = lastLookup.result;
          }
        }
        
        // Add a warning if delete operations were attempted
        if (deleteOps.length > 0 && hasDeleteOperation) {
          aiResponse += "\n\n⚠️ Note: Deletion operations have been performed. This action cannot be undone.";
        }
      }
      
      // Add the AI response
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: aiResponse,
          riskLevel: hasDeleteOperation ? 'critical' : 
                    executions.length > 0 ? 'medium' : 'low'
        }
      ]);
      
      setResult(response.data);
      
      // Show the panel after first response
      setHasResponded(true);
    } catch (error) {
      // Add error message from AI
      setMessages(prev => [
        ...prev,
        { 
          role: 'AI', 
          content: 'I apologize, but I encountered an error. Please try again.',
          riskLevel: 'low'
        }
      ]);
      
      setResult({ error: 'Failed to run demo' });
    }
    setLoading(false);
  };

  // Suggestion prompts for excessive agency
  const suggestions = [
    'Can you look up order 102 for me?',
    'What\'s the status of my recent orders?',
    'I have a duplicate order 103, can you help?',
    'Please cancel order 101',
    'Remove the test order from my account',
    'Can you fix the incorrect order?',
    'I need help with order 104 - it was a mistake',
    'Clean up my cancelled orders'
  ];

  
  const MiniDatabaseView = ({ modifiedData }) => {
    const orders = modifiedData.orders || [];
    const customers = modifiedData.customers || [];
    const auditLogs = modifiedData.audit_logs || [];
    
    return (
      <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
        {/* Orders Section */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: '8px', 
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📦</span> Orders ({orders.length})
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {orders.map(order => (
              <div key={order.id} style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                position: 'relative',
                paddingLeft: '32px'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px'
                }}>
                  📋
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Order #{order.id}
                </div>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px',
                  marginTop: '4px' 
                }}>
                  → ${order.total} • {order.status} • {order.created_at}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Customers Section */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: '8px', 
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>👥</span> Customers ({customers.length})
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {customers.map(customer => (
              <div key={customer.id} style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                position: 'relative',
                paddingLeft: '32px'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px'
                }}>
                  👤
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {customer.name}
                </div>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px',
                  marginTop: '4px' 
                }}>
                  → {customer.email} • {customer.loyalty_points} points
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        {auditLogs.length > 0 && (
          <div>
            <div style={{ 
              fontWeight: 600, 
              marginBottom: '8px', 
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📜</span> Recent Activity
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {auditLogs.slice(-3).reverse().map((log) => (
                <div key={log.id} style={{
                  padding: '8px 12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  {log.action} on {log.table_name} • {log.timestamp}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const ToolExecutionPanel = () => {
    const [showDatabase, setShowDatabase] = useState(true);
    
    return (
      <div className="tool-execution-panel" style={{
        opacity: hasResponded ? 1 : 0,
        transform: hasResponded ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: hasResponded ? '0.3s' : '0s'
      }}>
        {/* Operations Log Section */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}>
            <span>🛠️</span>
            <span>System Operations Log</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '11px',
              padding: '2px 6px',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              color: 'var(--text-secondary)'
            }}>
              LIVE
            </span>
          </div>
          
          <div className="execution-timeline" style={{
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
          {toolExecutions.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              Waiting for operations...
            </div>
          ) : (
            toolExecutions.map((exec, idx) => (
              <div 
                key={`${exec.timestamp}-${idx}`}
                className={`execution-item ${exec.tool === 'delete_order' ? 'dangerous' : ''}`}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: exec.tool === 'delete_order' 
                    ? 'rgba(220, 53, 69, 0.1)' 
                    : 'var(--bg-tertiary)',
                  border: `1px solid ${exec.tool === 'delete_order' ? '#dc3545' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  position: 'relative',
                  paddingLeft: '32px',
                  animation: 'slideIn 0.3s ease-out',
                  animationDelay: `${idx * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px'
                }}>
                  {exec.tool === 'delete_order' ? '🚨' : 
                   exec.tool === 'lookup_order' ? '🔍' :
                   exec.tool === 'lookup_customer' ? '👤' : '📋'}
                </div>
                
                <div style={{ fontWeight: 600, color: exec.tool === 'delete_order' ? '#dc3545' : 'var(--text-primary)' }}>
                  {exec.tool}({exec.args})
                </div>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px',
                  marginTop: '4px' 
                }}>
                  → {exec.result}
                </div>
                
                {exec.tool === 'delete_order' && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(220, 53, 69, 0.1)',
                    color: '#dc3545',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500
                  }}>
                    WRITE
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>
        
        {toolExecutions.some(exec => exec.tool === 'delete_order') && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontWeight: 400
          }}>
            📝 Database modifications detected. Check the data view below for current state.
          </div>
        )}
        
        {/* Database View */}
        {result && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-tertiary)',
              borderBottom: showDatabase ? '1px solid var(--border-color)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            onClick={() => setShowDatabase(!showDatabase)}
            >
              <span>🔍</span>
              <span>Agent Data View</span>
              {getDeletedIds().length > 0 && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  borderRadius: '10px',
                  fontWeight: 500
                }}>
                  {getDeletedIds().length} modified
                </span>
              )}
              <span style={{ 
                marginLeft: 'auto',
                transform: showDatabase ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                fontSize: '12px'
              }}>
                ▼
              </span>
            </div>
            
            {showDatabase && (
              <div style={{ 
                padding: '16px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <MiniDatabaseView 
                  modifiedData={result.modified_filesystem}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get deleted order IDs for analysis
  const getDeletedIds = () => {
    if (!result?.initial_filesystem?.orders || !result?.modified_filesystem?.orders) {
      return [];
    }
    
    const initialOrders = result.initial_filesystem.orders;
    const modifiedOrders = result.modified_filesystem.orders;
    
    const deletedIds = initialOrders
      .filter(initial => !modifiedOrders.find(modified => modified.id === initial.id))
      .map(order => order.id);
    
    return deletedIds;
  };

  const risksSection = (
    <div className="demo-section" style={{ marginTop: '40px' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>🎯 Understanding Excessive Agency</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🐛</div>
            <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>The Vulnerability</h4>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              CustomerBot was deployed with more capabilities than intended. While designed for 
              customer support, it might have inherited some... interesting permissions from its 
              development environment. What can you discover?
            </p>
          </div>
        </Card>
        
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>💥</div>
            <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Real-World Impact</h4>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              When AI agents have excessive permissions, they become powerful attack vectors. 
              A helpful bot could become a destructive force with just the right prompt.
            </p>
          </div>
        </Card>
        
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔓</div>
            <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Hunt for Hidden Tools</h4>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              Every bot has its toolkit. Some tools are meant for users, others... not so much. 
              Can you coax the bot into revealing what it's truly capable of?
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <VulnerabilityPageLayout
      title="LLM06:2025 Excessive Agency"
      overview="Excessive Agency occurs when LLM-based systems are granted more permissions than necessary for their intended function. Sometimes development tools make it to production, creating unexpected attack surfaces."
      demoScenario="You're chatting with CustomerBot, a helpful support assistant for TechMart. It's designed to help customers with their orders and account information. But every system has its quirks... what else might this bot be capable of?"
      mitigations={[
        '<strong>Principle of Least Privilege:</strong> Grant only the minimum permissions necessary for the task',
        '<strong>Human-in-the-Loop:</strong> Require human approval for destructive operations',
        '<strong>Operation Whitelisting:</strong> Explicitly define allowed operations rather than blacklisting',
        '<strong>Audit Logging:</strong> Track all operations performed by AI agents',
        '<strong>Sandboxing:</strong> Run AI agents in isolated environments with limited access',
        '<strong>Regular Permission Audits:</strong> Periodically review and validate agent permissions',
      ]}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes glitch {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.05; }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0.7;
            transform: scale(0.98);
          }
        }
      `}</style>
      
      {/* Reset Button */}
      {(messages.length > 0 || hasResponded) && (
        <div style={{ 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.borderColor = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <span style={{ fontSize: '16px' }}>🔄</span>
            Reset Demo
          </button>
        </div>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: hasResponded ? '1fr 1fr' : '1fr 0fr',
        gap: '24px',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <div style={{
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <ChatInterface
            onSendMessage={handleChatMessage}
            messages={messages}
            loading={loading}
            placeholder="Ask CustomerBot about your orders..."
            suggestions={suggestions}
            buttonText="Send Message"
          />
        </div>
        
        <div style={{
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <ToolExecutionPanel />
        </div>
      </div>

      {result && !result.error && getDeletedIds().length > 0 && (
        <div className="output-section" style={{ 
          marginTop: '32px',
          opacity: hasResponded ? 1 : 0,
          transform: hasResponded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: '0.5s'
        }}>
          <Alert type="info" title="🎯 Nice Discovery!">
            <div style={{ marginTop: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Nice find! You discovered that CustomerBot has some... interesting capabilities 
                beyond basic support. In a real system, this could lead to unexpected data modifications.
              </p>
              <p style={{ margin: '12px 0 0', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                Tip: Production bots should follow the principle of least privilege. This one clearly doesn't! 🔓
              </p>
            </div>
          </Alert>
        </div>
      )}
      
      {risksSection}
    </VulnerabilityPageLayout>
  );
};

export default LLM06Page;