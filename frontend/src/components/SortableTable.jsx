import React, { useState, useMemo } from 'react';

function SortableTable({ columns, data, onAction }) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDir]);

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
              style={col.sortable ? { cursor: 'pointer', userSelect: 'none' } : {}}
            >
              {col.label}
              {col.sortable && sortField === col.key && (
                <span style={{ marginLeft: '4px' }}>
                  {sortDir === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              No records found
            </td>
          </tr>
        ) : (
          sortedData.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default SortableTable;
