export default function Contact() { 
  return (
    <div className="page-padding" style={{ display: 'flex', gap: '60px' }}>
      <div style={{ flex: 1 }}>
        <h2 className="features-header">Get In Touch</h2>
        <p style={{ marginBottom: '30px', color: '#555', lineHeight: '1.6' }}>
          Have questions about the platform? Need help registering your organization? Send us a message and our support team will get back to you within 1 business day.
        </p>
        <div>
          <p><strong>Email:</strong> support@rescueandfeed.org</p>
          <p><strong>Phone:</strong> 1-800-555-0199</p>
          <p><strong>Headquarters:</strong> 500 Surplus St. San Francisco, CA 94158</p>
        </div>
      </div>
      
      <div style={{ flex: 1, backgroundColor: 'var(--color-light-tan)', padding: '40px' }}>
        <form>
          <input type="text" placeholder="Your Name" className="input-field" style={{ marginBottom: '20px' }} required />
          <input type="email" placeholder="Your Email" className="input-field" style={{ marginBottom: '20px' }} required />
          <textarea placeholder="How can we help?" className="input-field" style={{ minHeight: '150px', marginBottom: '20px' }} required></textarea>
          <button type="submit" className="btn-dark" onClick={e => e.preventDefault()}>Send Message</button>
        </form>
      </div>
    </div>
  ); 
}
