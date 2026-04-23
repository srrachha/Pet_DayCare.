import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Trash2, DollarSign, Activity, ShieldAlert, UserCheck, UserX } from 'lucide-react';

const AdminPanel = ({ addToast }) => {
  const [users, setUsers] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, revenueRes, activityRes] = await Promise.all([
        axios.get('/api/admin/users', { headers }),
        axios.get('/api/admin/revenue', { headers }),
        axios.get('/api/admin/activity', { headers })
      ]);
      setUsers(usersRes.data);
      setRevenue(revenueRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      console.error('Admin panel fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Remove user "${username}" and all their data?`)) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers });
      addToast?.(`User "${username}" removed`);
      fetchAll();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const totalRev = revenue.reduce((sum, r) => sum + (r.total || 0), 0);

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  if (loading) return null;

  return (
    <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginTop: '2rem' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600',
              backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Registered Users ({users.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.map(u => (
              <div key={u.id} className="glass" style={{
                padding: '1rem 1.25rem', borderRadius: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: u.role === 'admin' ? '#8b5cf615' : '#10b98115',
                    color: u.role === 'admin' ? '#8b5cf6' : '#10b981'
                  }}>
                    {u.role === 'admin' ? <ShieldAlert size={20} /> : <UserCheck size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{u.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.role === 'admin' ? 'Administrator' : 'Pet Parent'} • {u.pet_count} pets • {u.booking_count} bookings
                    </div>
                  </div>
                </div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(u.id, u.username)}
                    style={{
                      background: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.8rem', opacity: 0.7, transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.7}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Revenue Breakdown</h3>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Revenue</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ${totalRev.toFixed(0)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {revenue.map((r, idx) => {
              const pct = totalRev > 0 ? (r.total / totalRev) * 100 : 0;
              const colors = ['#8b5cf6', '#10b981', '#f59e0b'];
              return (
                <div key={idx} className="glass" style={{ padding: '1.25rem', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '700' }}>{r.service_type}</span>
                    <span style={{ fontWeight: '700', color: colors[idx % 3] }}>${(r.total || 0).toFixed(0)}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[idx % 3], transition: 'width 1s ease-out' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{r.count} booking{r.count !== 1 ? 's' : ''}</span>
                    <span>Avg: ${(r.average || 0).toFixed(0)}/stay</span>
                  </div>
                </div>
              );
            })}
            {revenue.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No revenue data yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activity.map((item, idx) => (
              <div key={idx} style={{
                paddingLeft: '20px', borderLeft: '2px solid var(--accent-primary)',
                position: 'relative', padding: '0.75rem 0.75rem 0.75rem 24px'
              }}>
                <div style={{
                  position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)',
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: item.status === 'confirmed' ? '#10b981' : item.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>{item.pet_name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> — {item.service_type} ({item.status})</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>by {item.owner}</span>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent activity.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPanel;
