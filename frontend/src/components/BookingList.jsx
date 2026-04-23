import React from 'react';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';

const BookingList = ({ bookings, isAdmin, onUpdateStatus, onAddUpdate, onViewHistory, onPay, onReview, bookingSearch, setBookingSearch, formatDate }) => (
  <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={20} color="var(--accent-secondary)" /> Bookings
      </h3>
      <div className="search-container" style={{ marginBottom: 0, flex: 1, maxWidth: '300px' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search bookings..." 
          value={bookingSearch}
          onChange={(e) => setBookingSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {bookings.map(booking => (
        <div key={booking.id} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
          {/* Status Indicator Bar */}
          <div style={{ 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            bottom: 0, 
            width: '4px', 
            backgroundColor: booking.status === 'confirmed' ? '#10b981' : booking.status === 'cancelled' ? '#ef4444' : '#f59e0b' 
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{booking.pet_name}</span>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              backgroundColor: booking.status === 'confirmed' ? '#10b98115' : '#f59e0b15',
              color: booking.status === 'confirmed' ? '#10b981' : '#f59e0b',
              textTransform: 'uppercase',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              {booking.status}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Clock size={16} /> 
            <span style={{ color: 'var(--text-main)' }}>{formatDate(booking.start_date)}</span> 
            <span style={{ opacity: 0.5 }}>→</span> 
            <span style={{ color: 'var(--text-main)' }}>{formatDate(booking.end_date)}</span>
            {isAdmin && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <User size={12} /> {booking.owner_name}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ opacity: 0.6 }}>Service:</span> <span style={{ fontWeight: '600' }}>{booking.service_type}</span>
            </div>
            <div style={{ color: 'var(--accent-primary)', fontWeight: '800', display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>
              ₹{parseFloat(booking.total_price).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
            {booking.status === 'pending' && !isAdmin && (
              <button onClick={() => onPay(booking)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}>Pay Now</button>
            )}
            {booking.status === 'completed' && !isAdmin && (
              <button onClick={() => onReview(booking)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}>Rate Stay</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
            {isAdmin ? (
              <>
                {booking.status === 'pending' && (
                  <>
                    <button onClick={() => onUpdateStatus(booking.id, 'confirmed')} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem', flex: 1 }}>Approve Stay</button>
                    <button onClick={() => onUpdateStatus(booking.id, 'cancelled')} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem', flex: 1 }}>Decline</button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button onClick={() => onAddUpdate(booking)} className="btn-primary" style={{ padding: '8px', fontSize: '0.8rem', flex: 1 }}>Update Pet Activity</button>
                    <button onClick={() => onUpdateStatus(booking.id, 'completed')} className="btn-secondary" style={{ padding: '8px', fontSize: '0.8rem', flex: 1, color: '#10b981', borderColor: '#10b98133' }}>Complete Stay</button>
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => onViewHistory(booking.id)} 
                className="btn-secondary" 
                style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <Clock size={14} /> View Stay Timeline
              </button>
            )}
          </div>
        </div>
      ))}
      {bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Calendar size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>{bookingSearch ? 'No bookings matched.' : 'No active bookings found.'}</p>
        </div>
      )}
    </div>
  </section>
);

export default BookingList;
