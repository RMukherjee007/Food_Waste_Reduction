import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import MapComponent from '../../components/MapComponent';

export default function ReceiverDashboard() {
  const { user, token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [msg, setMsg] = useState('');
  
  // Geolocation states
  const [location, setLocation] = useState({ lat: 40.730000, lng: -73.950000 }); // Default
  const [locInput, setLocInput] = useState('40.730000, -73.950000');

  const fetchNearby = async (lat, lng) => {
    const res = await fetch(`/api/batches/nearby?lat=${lat}&lng=${lng}&radius_km=10`);
    if (res.ok) {
      const data = await res.json();
      setBatches(data.batches || []);
    }
  };

  useEffect(() => { 
    fetchNearby(location.lat, location.lng); 

    // Setup Socket.IO
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.on('new_food_posted', (newBatch) => {
      // Real-time update! Prepend the new batch if it isn't already there
      setBatches(prev => {
        if(prev.find(b => b.batch_id === newBatch.batch_id)) return prev;
        return [newBatch, ...prev];
      });
      setMsg(`🔔 New food posted: ${newBatch.description}`);
    });

    return () => socket.disconnect();
  }, [location.lat, location.lng]);

  const requestBatch = async (batchId) => {
    const res = await fetch('/api/claims/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ batch_id: batchId })
    });
    if (res.ok) {
      setMsg(`Request sent for Batch #${batchId}! Waiting for restaurant approval.`);
      fetchNearby(location.lat, location.lng);
    } else {
      const data = await res.json();
      setMsg(data.error || 'Failed to request batch.');
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setLocation({ lat: newLat, lng: newLng });
          setLocInput(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
        },
        (err) => alert('Geolocation failed or denied. ' + err.message)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleManualLocation = (e) => {
    e.preventDefault();
    const parts = locInput.split(',');
    if (parts.length === 2) {
      setLocation({ lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) });
    }
  };

  // Convert batches to map markers
  const mapMarkers = batches.map(b => ({
    id: b.batch_id,
    lat: b.latitude || location.lat + (Math.random()-0.5)*0.05, // fallback if no lat/lng
    lng: b.longitude || location.lng + (Math.random()-0.5)*0.05,
    title: b.donor_name || 'Restaurant',
    description: b.description
  }));

  return (
    <div className="page-padding">
      <h2 className="features-header">Receiver Dashboard</h2>
      <p style={{marginBottom: '20px'}}>Welcome back, {user?.name}. Find available food nearby:</p>
      
      {/* Geolocation Controls */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={handleGetLocation} className="btn-dark">Use My Location</button>
        <span>OR Enter coordinates:</span>
        <form onSubmit={handleManualLocation} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="input-field" 
            value={locInput} 
            onChange={e => setLocInput(e.target.value)} 
            style={{ width: '250px' }} 
            placeholder="Lat, Lng" 
          />
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
        </form>
      </div>

      {msg && <div className="status-message" style={{marginBottom: '20px'}}>{msg}</div>}

      {/* Interactive Map */}
      <div style={{ marginBottom: '40px', border: '2px solid var(--color-dark-brown)', borderRadius: '8px', overflow: 'hidden' }}>
        <MapComponent center={[location.lat, location.lng]} markers={mapMarkers} />
      </div>

      <h3 className="form-title">Nearby Food Batches</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        {batches.length === 0 ? <p>No food available nearby at the moment.</p> : batches.map(b => (
          <div key={b.batch_id} style={{ backgroundColor: 'var(--color-light-tan)', padding: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{b.description}</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              <strong>Type:</strong> {b.batch_type} <br/>
              <strong>Weight:</strong> {b.weight_kg} kg <br/>
              <strong>Distance:</strong> {b.distance_km ? Number(b.distance_km).toFixed(2) : '?'} km away
            </p>
            <button onClick={() => requestBatch(b.batch_id)} className="btn-dark" style={{ width: 'auto' }}>Request Pickup</button>
          </div>
        ))}
      </div>
    </div>
  );
}
