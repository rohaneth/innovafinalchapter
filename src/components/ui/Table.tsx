import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
  data: React.ReactNode[][];
}

export function Table({ headers, data, className = '', ...props }: TableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table 
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left'
        }}
        className={className} 
        {...props}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
            {headers.map((header, idx) => (
              <th key={idx} style={{ padding: '12px 16px', fontWeight: '500', fontSize: '14px' }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s ease' }} 
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} style={{ padding: '16px' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
