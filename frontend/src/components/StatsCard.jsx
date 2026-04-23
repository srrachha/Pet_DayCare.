import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="glass" style={{ 
    padding: '1.5rem', 
    borderRadius: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem',
    flex: 1,
    minWidth: '200px',
    transition: 'transform 0.3s ease',
    cursor: 'default'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ 
      padding: '12px', 
      borderRadius: '12px', 
      backgroundColor: `${color}11`, 
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{value}</div>
      {subtext && <div style={{ fontSize: '0.7rem', color: color, marginTop: '2px' }}>{subtext}</div>}
    </div>
  </div>
);

export default StatsCard;
