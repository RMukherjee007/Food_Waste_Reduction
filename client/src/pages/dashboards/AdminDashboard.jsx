import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState({ metrics: {}, users: [] });

  useEffect(() => {
    fetch('/api/admin/overview', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(json => setData(json))
    .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="page-padding">
      <h2 className="features-header" style={{ color: 'var(--color-dark-brown)' }}>Admin Control Panel</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '60px' }}>
        <div style={{ flex: 1, padding: '30px', backgroundColor: 'var(--color-dark-brown)', color: 'var(--color-text-light)' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '3rem' }}>{data.metrics.totalUsers || 0}</p>
        </div>
        <div style={{ flex: 1, padding: '30px', backgroundColor: 'var(--color-dark-brown)', color: 'var(--color-text-light)' }}>
          <h3>Total Food Batches</h3>
          <p style={{ fontSize: '3rem' }}>{data.metrics.totalBatches || 0}</p>
        </div>
        <div style={{ flex: 1, padding: '30px', backgroundColor: 'var(--color-dark-brown)', color: 'var(--color-text-light)' }}>
          <h3>Successful Claims</h3>
          <p style={{ fontSize: '3rem' }}>{data.metrics.totalClaims || 0}</p>
        </div>
      </div>

      <h3 className="form-title">Registered Users</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-dark-brown)', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Role</th>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Address</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map(u => (
            <tr key={u.user_id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px' }}>{u.user_id}</td>
              <td style={{ padding: '10px' }}><strong>{u.role}</strong></td>
              <td style={{ padding: '10px' }}>{u.name}</td>
              <td style={{ padding: '10px' }}>{u.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
