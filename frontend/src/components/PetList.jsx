import React from 'react';
import { Dog, Edit, Trash2, Info } from 'lucide-react';

const PetList = ({ pets, isAdmin, onEdit, onDelete, petSearch, setPetSearch }) => (
  <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Dog size={20} color="var(--accent-primary)" /> Pets
      </h3>
      <div className="search-container" style={{ marginBottom: 0, flex: 1, maxWidth: '300px' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search pets..." 
          value={petSearch}
          onChange={(e) => setPetSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {pets.map(pet => (
        <div key={pet.id} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {pet.name} 
              {isAdmin && <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontWeight: 'normal' }}>• Owned by {pet.owner_name || 'User'}</span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pet.breed || 'Unknown Breed'} • {pet.age || '?'} yrs</div>
            <div style={{ 
              marginTop: '6px',
              fontSize: '0.7rem', 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 10px', 
              borderRadius: '20px', 
              backgroundColor: pet.vaccination_status === 'Up-to-date' ? '#10b98115' : '#ef444415',
              color: pet.vaccination_status === 'Up-to-date' ? '#10b981' : '#ef4444',
              border: `1px solid ${pet.vaccination_status === 'Up-to-date' ? '#10b98133' : '#ef444433'}`
            }}>
              Vaccination: {pet.vaccination_status} {pet.vaccination_expiry ? `(Exp: ${pet.vaccination_expiry})` : ''}
            </div>
          </div>
          {!isAdmin && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => onEdit(pet)}
                style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => onDelete(pet.id)}
                style={{ background: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {pets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Info size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>{petSearch ? 'No pets match your criteria.' : 'No pets registered yet.'}</p>
        </div>
      )}
    </div>
  </section>
);

export default PetList;
