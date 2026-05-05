export default function About() { 
  return (
    <div className="page-padding">
      <h2 className="features-header">About Rescue&Feed</h2>
      <p style={{ maxWidth: '600px', lineHeight: '1.6', color: '#444' }}>
        Rescue&Feed was founded with a single mission: to bridge the gap between surplus food and food insecurity.
        Every single day, restaurants and university mess halls prepare more food than they can sell, while nearby
        charities struggle to keep their pantries full. By creating a direct, real-time connection between donors
        and receivers, we eliminate the logistical friction that causes food waste.
      </p>
      <div style={{ marginTop: '40px', backgroundColor: 'var(--color-light-tan)', padding: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Our Core Values</h3>
        <ul style={{ lineHeight: '1.8', marginLeft: '20px' }}>
          <li><strong>Zero Waste:</strong> Food belongs in stomachs, not landfills.</li>
          <li><strong>Community First:</strong> Empowering local NGOs to serve their neighborhoods.</li>
          <li><strong>Real-Time Action:</strong> Speed is critical when dealing with perishable goods.</li>
        </ul>
      </div>
    </div>
  ); 
}
