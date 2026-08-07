import React, { useState, useEffect } from 'react';

function RatingModal({ isOpen, onClose, onSubmit, currentRating, storeName }) {
  const [selected, setSelected] = useState(currentRating || 0);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    setSelected(currentRating || 0);
  }, [currentRating, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selected === 0) return;
    onSubmit(selected);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>Rate {storeName}</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>Select your rating:</p>
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${star <= (hovered || selected) ? 'star-active' : 'star-inactive'}`}
              onClick={() => setSelected(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              ★
            </span>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '8px' }}>
          {selected > 0 ? `You selected: ${selected} star${selected > 1 ? 's' : ''}` : 'No rating selected'}
        </p>
        <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selected === 0}
          >
            Submit Rating
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;
