import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Donors from './pages/Donors';
import Charities from './pages/Charities';
import HowToJoin from './pages/HowToJoin';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import DonorDashboard from './pages/dashboards/DonorDashboard';
import ReceiverDashboard from './pages/dashboards/ReceiverDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      {/* Shared Navbar */}
      <nav className="navbar">
        <Link to="/" className="nav-brand" style={{textDecoration: 'none', color: 'inherit'}}>Rescue&Feed</Link>
        <div className="nav-links">
          <Link to="/about">About</Link>
          <Link to="/donors">Donors</Link>
          <Link to="/charities">Charities</Link>
          <Link to="/contact">Contact</Link>
          {user && (
            <span onClick={logout} style={{cursor: 'pointer', border: '1px solid white', padding: '5px 15px', borderRadius: '4px'}}>Logout</span>
          )}
        </div>
      </nav>

      {/* Route Views */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/how-to-join" element={<HowToJoin />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Dashboards */}
        <Route path="/donor" element={<ProtectedRoute allowedRoles={['Restaurant']}><DonorDashboard /></ProtectedRoute>} />
        <Route path="/receiver" element={<ProtectedRoute allowedRoles={['Charity']}><ReceiverDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>

      {/* Shared Footer */}
      <footer className="footer-section">
        <div className="footer-col">
          <p>892 Unity Avenue<br/>Chicago, IL 60601</p>
          <p style={{marginTop: '20px'}}>Privacy Policy<br/>Accessibility Statement</p>
        </div>
        <div className="footer-col">
          <Link to="/about">About</Link>
          <Link to="/donors">Donors</Link>
          <Link to="/charities">Charities</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col text-right">
          <p>123-456-7890<br/>info@rescueandfeed.org</p>
          <div className="social-icons">
            <span>fb</span> <span>ig</span> <span>in</span> <span>x</span>
          </div>
        </div>
      </footer>
      <div className="footer-bottom">
        2026 by Rescue&Feed. Powered by Community.
      </div>
    </div>
  );
}

export default App;
