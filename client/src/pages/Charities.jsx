export default function Charities() { 
  return (
    <div className="page-padding">
      <h2 className="features-header">For Charities & NGOs</h2>
      <p style={{ maxWidth: '600px', lineHeight: '1.6', color: '#444', marginBottom: '30px' }}>
        Tired of calling around to find food donations? Our platform brings the food to you.
      </p>
      <div style={{ backgroundColor: 'var(--color-dark-brown)', color: 'white', padding: '40px' }}>
        <h3 style={{ marginBottom: '20px' }}>How It Works for Receivers</h3>
        <ul style={{ lineHeight: '2', fontSize: '1.1rem', marginLeft: '20px' }}>
          <li><strong>Live Map:</strong> See all available food batches within a 10km radius.</li>
          <li><strong>Instant Claims:</strong> Reserve food with one click. Our system guarantees no double-bookings.</li>
          <li><strong>Direct Pickup:</strong> Get the exact address and pickup instructions immediately.</li>
          <li><strong>Reliable Supply:</strong> Access high-quality meals from vetted local restaurants.</li>
        </ul>
      </div>
    </div>
  ); 
}
