import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {title && <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
