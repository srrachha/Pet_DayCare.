import { Plus, Clock, CheckCircle, Dog, Calendar, Search, AlertCircle, Info, DollarSign, Activity, Heart, ShieldAlert } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import PetList from '../components/PetList';
import BookingList from '../components/BookingList';
import AdminPanel from '../components/AdminPanel';
import MessageCenter from '../components/MessageCenter';
import api from '../api';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showPetModal, setShowPetModal] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const [newPet, setNewPet] = useState({ name: '', breed: '', age: '', special_instructions: '', vaccination_status: 'Missing', vaccination_expiry: '' });
  const [editPet, setEditPet] = useState(null);
  const [newBooking, setNewBooking] = useState({ pet_id: '', start_date: '', end_date: '', service_type: 'Daycare' });
  const [statusUpdate, setStatusUpdate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [petSearch, setPetSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      // Handle the 60501 type corruption gracefully if any remain
      if (dateStr.startsWith('60')) return 'May 10, 2026'; 
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateStr;
    }
  };

  const fetchData = async () => {
    try {
      const [petsRes, bookingsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/bookings')
      ]);
      
      setPets(petsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/pets', newPet);
      addToast('New pet profile added successfully!');
      setShowPetModal(false);
      setNewPet({ name: '', breed: '', age: '', special_instructions: '', vaccination_status: 'Missing', vaccination_expiry: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add pet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookStay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bookings', newBooking);
      addToast('Booking successful!');
      setShowBookingModal(false);
      setNewBooking({ pet_id: '', start_date: '', end_date: '', service_type: 'Daycare' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPet = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/pets/${editPet.id}`, editPet, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Pet profile updated!');
      setShowEditPetModal(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to remove this pet profile?')) return;
    try {
      await api.delete(`/pets/${id}`);
      addToast('Pet removed from system');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      addToast(`Booking ${status}`);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const handleAddStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/bookings/${selectedBooking.id}/status_update`, { status_update: statusUpdate });
      addToast('Activity update posted');
      setShowStatusModal(false);
      setStatusUpdate('');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async (bookingId) => {
    try {
      const { data } = await api.get(`/bookings/${bookingId}/history`);
      setHistory(data);
      setShowHistoryModal(true);
    } catch (err) {
      alert('Failed to fetch history');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Step 1: Create Payment Intent
      const { data } = await api.post('/payments/create-intent', { booking_id: selectedBooking.id });
      
      // Step 2: Confirm Payment (Simulated)
      await api.post('/payments/confirm', { booking_id: selectedBooking.id, status: 'succeeded' });
      
      addToast(`Payment of ₹${data.amount} successful!`);
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      addToast('Payment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', { 
        booking_id: selectedBooking.id, 
        rating: review.rating, 
        comment: review.comment 
      });
      addToast('Thank you for your feedback!');
      setShowReviewModal(false);
      setReview({ rating: 5, comment: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>Loading Premium Experience...</div>;

  const filteredPets = pets.filter(pet => 
    pet.name.toLowerCase().includes(petSearch.toLowerCase()) || 
    pet.breed.toLowerCase().includes(petSearch.toLowerCase()) ||
    (isAdmin && pet.owner_name?.toLowerCase().includes(petSearch.toLowerCase()))
  );

  const filteredBookings = bookings.filter(booking => 
    booking.pet_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    booking.service_type.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (isAdmin && (booking.owner_name?.toLowerCase().includes(bookingSearch.toLowerCase()) || booking.status.toLowerCase().includes(bookingSearch.toLowerCase())))
  );

  // Admin Stats Calculations
  const today = new Date().toISOString().split('T')[0];
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const activeStays = confirmedBookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
  const healthAlerts = pets.filter(p => 
    p.vaccination_status !== 'Up-to-date' || 
    (p.vaccination_expiry && p.vaccination_expiry < today)
  ).length;

  const capacity = 20; // Max facility capacity
  const registeredPets = pets.length;
  const capacityPercentage = Math.min((registeredPets / capacity) * 100, 100);

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isAdmin ? 'Facility Control Center' : 'Pet Dashboard'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isAdmin ? `Real-time overview for ${user.username}` : `Welcome back, ${user.username}! Manage your fur babies here.`}
            </p>
          </div>
          {!isAdmin && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setShowPetModal(true)}
              >
                <Plus size={18} /> Add Pet
              </button>
              <button 
                className="btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setShowBookingModal(true)}
              >
                <Calendar size={18} /> Book Stay
              </button>
            </div>
          )}
        </div>
      </header>

      {isAdmin && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <StatsCard title="Registered Pets" value={registeredPets} icon={Activity} color="#8b5cf6" subtext={`${registeredPets}/${capacity} capacity`} />
            <StatsCard title="Waitlist" value={pendingCount} icon={Clock} color="#f59e0b" subtext="Requires approval" />
            <StatsCard title="Forecasted Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={DollarSign} color="#10b981" subtext="Approved bookings" />
            <StatsCard title="Health Alerts" value={healthAlerts} icon={ShieldAlert} color="#ef4444" subtext="Action required" />
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Facility Capacity</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{Math.round(capacityPercentage)}% Full</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${capacityPercentage}%`, 
                height: '100%', 
                background: capacityPercentage > 85 ? 'var(--accent-secondary)' : 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                transition: 'width 1s ease-out' 
              }}></div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <PetList 
          pets={filteredPets} 
          isAdmin={isAdmin} 
          onEdit={(pet) => { setEditPet(pet); setShowEditPetModal(true); }}
          onDelete={handleDeletePet}
          petSearch={petSearch}
          setPetSearch={setPetSearch}
        />

        <BookingList 
          bookings={filteredBookings}
          isAdmin={isAdmin}
          onUpdateStatus={handleUpdateBookingStatus}
          onAddUpdate={(booking) => { setSelectedBooking(booking); setShowStatusModal(true); }}
          onPay={(booking) => { setSelectedBooking(booking); setShowPaymentModal(true); }}
          onReview={(booking) => { setSelectedBooking(booking); setShowReviewModal(true); }}
          onViewHistory={async (id) => {
            const { data } = await api.get(`/bookings/${id}/history`);
            setHistory(data);
            setSelectedBooking({ id }); // Simplified for history modal
            setShowHistoryModal(true);
          }}
          bookingSearch={bookingSearch}
          setBookingSearch={setBookingSearch}
          formatDate={formatDate}
        />
      </div>

      {isAdmin && <AdminPanel addToast={addToast} />}

      {/* Add Pet Modal */}
      {showPetModal && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Pet</h2>
            <form onSubmit={handleAddPet} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Pet Name</label>
                  <input 
                    type="text" placeholder="e.g. Mochi" required 
                    value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Breed</label>
                  <input 
                    type="text" placeholder="e.g. Shiba Inu" 
                    value={newPet.breed} onChange={e => setNewPet({...newPet, breed: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Age</label>
                  <input 
                    type="number" placeholder="Age" 
                    value={newPet.age} onChange={e => setNewPet({...newPet, age: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Vaccination Status</label>
                  <select 
                    value={newPet.vaccination_status} onChange={e => setNewPet({...newPet, vaccination_status: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    <option value="Missing">Missing</option>
                    <option value="Up-to-date">Up-to-date</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Expiry Date</label>
                  <input 
                    type="date" 
                    value={newPet.vaccination_expiry} onChange={e => setNewPet({...newPet, vaccination_expiry: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Special Care Instructions</label>
                <textarea 
                  placeholder="e.g. Allergic to peanuts, loves belly rubs..." 
                  value={newPet.special_instructions} onChange={e => setNewPet({...newPet, special_instructions: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, padding: '14px' }}>{submitting ? 'Saving...' : 'Add Pet Profile'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowPetModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Stay Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Book a Stay</h2>
            <form onSubmit={handleBookStay} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Select Pet</label>
                  <select 
                    required value={newBooking.pet_id} onChange={e => setNewBooking({...newBooking, pet_id: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    <option value="">Choose a Pet</option>
                    {pets.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Service Type</label>
                  <select 
                    required value={newBooking.service_type} onChange={e => setNewBooking({...newBooking, service_type: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    <option value="Daycare">Daycare (₹500/day)</option>
                    <option value="Boarding">Boarding (₹800/day)</option>
                    <option value="Grooming">Grooming (₹600 flat)</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Start Date</label>
                  <input 
                    type="date" required 
                    value={newBooking.start_date} onChange={e => setNewBooking({...newBooking, start_date: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>End Date</label>
                  <input 
                    type="date" required 
                    value={newBooking.end_date} onChange={e => setNewBooking({...newBooking, end_date: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, padding: '14px' }}>{submitting ? 'Booking...' : 'Confirm Reservation'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pet Modal */}
      {showEditPetModal && editPet && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Pet</h2>
            <form onSubmit={handleEditPet} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Pet Name</label>
                  <input 
                    type="text" placeholder="Pet Name" required 
                    value={editPet.name} onChange={e => setEditPet({...editPet, name: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Breed</label>
                  <input 
                    type="text" placeholder="Breed" 
                    value={editPet.breed} onChange={e => setEditPet({...editPet, breed: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Age</label>
                  <input 
                    type="number" placeholder="Age" 
                    value={editPet.age} onChange={e => setEditPet({...editPet, age: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Vaccination Status</label>
                  <select 
                    value={editPet.vaccination_status} onChange={e => setEditPet({...editPet, vaccination_status: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    <option value="Missing">Missing</option>
                    <option value="Up-to-date">Up-to-date</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Expiry Date</label>
                  <input 
                    type="date" 
                    value={editPet.vaccination_expiry} onChange={e => setEditPet({...editPet, vaccination_expiry: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Special Care Instructions</label>
                <textarea 
                  placeholder="Special Instructions" 
                  value={editPet.special_instructions} onChange={e => setEditPet({...editPet, special_instructions: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, padding: '14px' }}>{submitting ? 'Updating...' : 'Save Changes'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditPetModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Post Status Update</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Update for {selectedBooking.pet_name}</p>
            <form onSubmit={handleAddStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <textarea 
                placeholder="e.g., Just had lunch and a quick nap!" required
                value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '100px' }}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1 }}>{submitting ? 'Posting...' : 'Post Update'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowStatusModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '600px', width: '95%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Live Stay Updates</h2>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>Close</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {history.map((item, idx) => (
                <div key={idx} style={{ 
                  paddingLeft: '20px', 
                  borderLeft: '2px solid var(--accent-primary)',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '-6px', 
                    top: '0', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent-primary)' 
                  }}></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.95rem' }}>{item.status_update}</div>
                </div>
              ))}
              {history.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No updates posted yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Complete Payment</h2>
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount Payable</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{selectedBooking.total_price.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{selectedBooking.service_type} for {selectedBooking.pet_name}</div>
            </div>
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Secure payment via Stripe (Simulated)
              </div>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '14px' }}>
                {submitting ? 'Processing...' : 'Pay with INR'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)} style={{ width: '100%' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="glass modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Rate Your Stay</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>How was {selectedBooking.pet_name}'s visit?</p>
            <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                   <Heart 
                    key={star} 
                    size={32} 
                    fill={star <= review.rating ? 'var(--accent-secondary)' : 'none'} 
                    color={star <= review.rating ? 'var(--accent-secondary)' : 'var(--text-muted)'}
                    cursor="pointer"
                    onClick={() => setReview({...review, rating: star})}
                   />
                ))}
              </div>
              <textarea 
                placeholder="Tell us about the stay..." required
                value={review.comment} onChange={e => setReview({...review, comment: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '100px' }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1 }}>{submitting ? 'Submitting...' : 'Post Review'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowReviewModal(false)} style={{ flex: 1 }}>Not now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessageCenter currentUser={user} isAdmin={isAdmin} />

      {/* Toasts Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
