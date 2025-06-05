import React from 'react';

interface Metric {
  label: string;
  value: string | number;
  type?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  unit?: string;
  description?: string;
}

interface MetricsDisplayProps {
  metrics: Metric[];
  title?: string;
  layout?: 'grid' | 'list';
  className?: string;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics,
  title = '📊 Metrics',
  layout = 'grid',
  className = '',
}) => {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'var(--success-color)';
      case 'danger':
        return 'var(--danger-color)';
      case 'warning':
        return 'var(--warning-color)';
      case 'info':
        return 'var(--accent-color)';
      default:
        return 'var(--text-primary)';
    }
  };

  const getTypeBackground = (type?: string) => {
    switch (type) {
      case 'success':
        return '#e8f5e8';
      case 'danger':
        return '#ffebee';
      case 'warning':
        return '#fff3e0';
      case 'info':
        return '#e3f2fd';
      default:
        return 'var(--bg-secondary)';
    }
  };

  return (
    <div className={`output-panel ${className}`}>
      <h4>{title}</h4>
      
      <div style={{
        display: layout === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fit, minmax(120px, 1fr))' : undefined,
        flexDirection: layout === 'list' ? 'column' : undefined,
        gap: '12px',
      }}>
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: `1px solid ${getTypeColor(metric.type)}`,
              backgroundColor: getTypeBackground(metric.type),
              textAlign: layout === 'grid' ? 'center' : 'left',
            }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'var(--text-muted)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {metric.label}
            </div>
            
            <div style={{
              fontSize: layout === 'grid' ? '18px' : '14px',
              fontWeight: 'bold',
              color: getTypeColor(metric.type),
              marginBottom: metric.description ? '4px' : '0',
            }}>
              {metric.value}
              {metric.unit && (
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'normal',
                  marginLeft: '2px' 
                }}>
                  {metric.unit}
                </span>
              )}
            </div>
            
            {metric.description && (
              <div style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                lineHeight: '1.3',
              }}>
                {metric.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsDisplay;