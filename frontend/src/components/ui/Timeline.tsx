import React from 'react';

export interface TimelineStep {
  id: string;
  number: number;
  label: string;
  description?: string;
  icon?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface TimelineProps {
  steps: TimelineStep[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

const Timeline: React.FC<TimelineProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal'
}) => {
  const getStepClass = (step: TimelineStep) => {
    let classes = ['timeline-step'];
    
    if (step.status === 'completed' || step.number < currentStep) {
      classes.push('completed');
    }
    if (step.number === currentStep) {
      classes.push('current');
    }
    if (step.status === 'error') {
      classes.push('error');
    }
    
    return classes.join(' ');
  };

  const isClickable = (step: TimelineStep) => {
    return onStepClick && (step.status === 'completed' || step.number < currentStep);
  };

  return (
    <div className={`timeline timeline-${orientation}`}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={getStepClass(step)}
          onClick={() => isClickable(step) && onStepClick?.(step.number)}
          style={{ cursor: isClickable(step) ? 'pointer' : 'default' }}
        >
          <div className="timeline-step-number">
            {step.icon ? (
              <span className="timeline-step-icon">{step.icon}</span>
            ) : (
              step.number
            )}
          </div>
          <div className="timeline-step-content">
            <div className="timeline-step-label">{step.label}</div>
            {step.description && (
              <div className="timeline-step-description">{step.description}</div>
            )}
          </div>
          {index < steps.length - 1 && <div className="timeline-connector" />}
        </div>
      ))}
    </div>
  );
};

export default Timeline;