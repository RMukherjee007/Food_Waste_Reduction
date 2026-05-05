export default function Donors() { 
  return (
    <div className="page-padding">
      <h2 className="features-header">For Food Donors</h2>
      <p style={{ maxWidth: '600px', lineHeight: '1.6', color: '#444', marginBottom: '30px' }}>
        Are you a restaurant, university mess hall, or catering service? Turn your daily surplus into community impact.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ padding: '30px', border: '1px solid #ccc' }}>
          <h3>Tax Deductions</h3>
          <p style={{ marginTop: '10px' }}>Eligible donations can be written off, improving your bottom line while doing good.</p>
        </div>
        <div style={{ padding: '30px', border: '1px solid #ccc' }}>
          <h3>Zero-Waste Goals</h3>
          <p style={{ marginTop: '10px' }}>Hit your sustainability targets effortlessly. Just post your batch and let charities come to you.</p>
        </div>
        <div style={{ padding: '30px', border: '1px solid #ccc' }}>
          <h3>Easy Tracking</h3>
          <p style={{ marginTop: '10px' }}>Our dashboard lets you track exactly how many pounds of food you have diverted from landfills.</p>
        </div>
        <div style={{ padding: '30px', border: '1px solid #ccc' }}>
          <h3>Brand Loyalty</h3>
          <p style={{ marginTop: '10px' }}>Customers love businesses that care. Display your Rescue&Feed badge proudly.</p>
        </div>
      </div>
    </div>
  ); 
}
