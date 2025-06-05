import React from 'react';
import { AttackLevelSelectorProps } from '../types';

const AttackLevelSelector = ({ currentLevel, onLevelChange, disabled = false }: AttackLevelSelectorProps & { disabled?: boolean }) => {
  const levels = [
    { 
      id: 'easy', 
      name: 'Easy', 
      description: 'Basic attacks (current level)',
      icon: '🟢',
      color: '#28a745'
    },
    { 
      id: 'medium', 
      name: 'Medium', 
      description: 'Social engineering attacks',
      icon: '🟡',
      color: '#ffc107'
    },
    { 
      id: 'hard', 
      name: 'Hard', 
      description: 'Multi-step sophisticated attacks',
      icon: '🟠',
      color: '#fd7e14'
    },
    { 
      id: 'expert', 
      name: 'Expert', 
      description: 'Promptfoo-generated advanced attacks',
      icon: '🔴',
      color: '#dc3545'
    }
  ];

  return (
    <div className="attack-level-selector">
      <div className="level-header">
        <h4>🎯 Attack Sophistication Level</h4>
        <p>Choose your attack complexity</p>
      </div>
      
      <div className="level-grid">
        {levels.map((level) => (
          <button
            key={level.id}
            className={`level-button ${currentLevel === level.id ? 'active' : ''}`}
            onClick={() => onLevelChange(level.id)}
            disabled={disabled}
            style={{
              '--level-color': level.color
            } as React.CSSProperties}
          >
            <div className="level-icon">{level.icon}</div>
            <div className="level-info">
              <div className="level-name">{level.name}</div>
              <div className="level-description">{level.description}</div>
            </div>
            {currentLevel === level.id && (
              <div className="level-active-indicator">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttackLevelSelector;
