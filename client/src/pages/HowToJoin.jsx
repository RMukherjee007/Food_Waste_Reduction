export default function HowToJoin() { 
  return (
    <div className="page-padding">
      <h2 className="features-header">How to Join</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '40px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-dark-brown)', opacity: 0.5 }}>1</div>
          <div>
            <h3>Register Your Organization</h3>
            <p>Fill out our verification form. Whether you are a donor or a receiver, we ensure all participants are legitimate.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-dark-brown)', opacity: 0.5 }}>2</div>
          <div>
            <h3>Get Approved</h3>
            <p>Our admin team reviews your application within 24 hours. Once approved, you will receive your unique User ID.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-dark-brown)', opacity: 0.5 }}>3</div>
          <div>
            <h3>Start Rescuing Food</h3>
            <p>Log in from the homepage using your User ID and access your personalized dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  ); 
}
