import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DonorDashboard() {
  const { user, token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({ successful_pickups: 0 });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [form, setForm] = useState({ description: '', batch_type: 'Dry_Goods', weight_kg: '', expiry_hours: '24' });
  const [msg, setMsg] = useState('');

  // Geolocation
  const [locInput, setLocInput] = useState('40.730610, -73.935242');

  const fetchBatches = async () => {
    const res = await fetch('/api/batches/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setBatches(data.batches || []);
      setStats(data.stats || { successful_pickups: 0 });
    }
  };

  const fetchPendingRequests = async () => {
    const res = await fetch('/api/claims/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setPendingRequests(await res.json());
  };

  useEffect(() => { 
    fetchBatches(); 
    fetchPendingRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      // sending coordinates could be added here if DB was updated, for now just relying on user profile lat/lng
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg('Batch posted successfully!');
      setForm({ description: '', batch_type: 'Dry_Goods', weight_kg: '', expiry_hours: '24' });
      fetchBatches();
    } else {
      setMsg('Failed to post batch.');
    }
  };

  const handleGetLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocInput(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        (err) => alert('Geolocation failed: ' + err.message)
      );
    }
  };

  const handleAcceptRequest = async (claimId) => {
    const res = await fetch('/api/claims/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ claim_id: claimId })
    });
    if (res.ok) {
      alert('Request accepted successfully!');
      fetchPendingRequests();
      fetchBatches(); // to refresh status
    } else {
      alert('Failed to accept request.');
    }
  };

  return (
    <div className="page-padding" style={{ backgroundColor: 'var(--color-light-tan)', minHeight: '100vh' }}>
      <h2 className="features-header">Donor Dashboard</h2>
      <p style={{marginBottom: '20px'}}>Welcome back, {user?.name}</p>

      {/* Gamification Stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'var(--color-dark-brown)', color: 'white', padding: '20px', borderRadius: '8px', minWidth: '200px' }}>
          <h3>Total Meals Donated</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.successful_pickups * 10} <span style={{fontSize: '1rem', fontWeight: 'normal'}}>est.</span></p>
        </div>
        <div style={{ backgroundColor: 'var(--color-dark-brown)', color: 'white', padding: '20px', borderRadius: '8px', minWidth: '200px' }}>
          <h3>Successful Pickups</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.successful_pickups}</p>
        </div>
        <div style={{ backgroundColor: '#166534', color: 'white', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Zero-Waste Hero 🏆</h3>
          <p style={{ marginTop: '10px' }}>Your consistent donations are making a massive impact on the environment and the community!</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Post Form */}
        <div className="quote-form-container" style={{ position: 'relative', right: '0', bottom: '0', flex: '1 1 400px' }}>
          <h3 className="form-title">Post Surplus Food</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" className="input-field" placeholder="Description (e.g. 50 sandwiches)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            <select className="input-field" value={form.batch_type} onChange={e => setForm({...form, batch_type: e.target.value})}>
              <option value="Dry_Goods">Dry Goods</option>
              <option value="Refrigerated">Refrigerated</option>
            </select>
            <div className="form-row">
              <input type="number" step="0.1" className="input-field" placeholder="Weight (kg)" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} required />
              <input type="number" className="input-field" placeholder="Expires in (Hours)" value={form.expiry_hours} onChange={e => setForm({...form, expiry_hours: e.target.value})} required />
            </div>

            <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#555' }}>Pickup Location Coordinates:</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" className="input-field" value={locInput} onChange={e => setLocInput(e.target.value)} style={{ marginBottom: 0 }} />
              <button className="btn-primary" onClick={handleGetLocation} style={{ width: 'auto', padding: '0 15px' }}>Get Location</button>
            </div>

            <button type="submit" className="btn-dark">Post Batch</button>
            {msg && <p style={{marginTop: '10px'}}>{msg}</p>}
          </form>
        </div>

        {/* Pending Requests & Listings */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <h3 className="form-title">Incoming Requests</h3>
            {pendingRequests.length === 0 ? <p>No pending requests.</p> : pendingRequests.map(r => (
              <div key={r.claim_id} style={{ padding: '15px', border: '1px solid #eab308', backgroundColor: '#fefce8', marginBottom: '10px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{r.description}</strong> ({r.weight_kg} kg)<br/>
                    Requested by: <strong>{r.charity_name}</strong>
                  </div>
                  <button onClick={() => handleAcceptRequest(r.claim_id)} className="btn-dark" style={{ width: 'auto', padding: '8px 15px', backgroundColor: '#16a34a', border: 'none' }}>Accept</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <h3 className="form-title">My Active Listings</h3>
            {batches.length === 0 ? <p>No active listings.</p> : batches.map(b => (
              <div key={b.batch_id} style={{ padding: '15px', borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
                <strong>{b.description}</strong> ({b.weight_kg} kg)<br/>
                Status: <span style={{ color: b.status === 'locked' ? '#eab308' : b.status === 'claimed' ? 'red' : 'green' }}>{b.status}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
