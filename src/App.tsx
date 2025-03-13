
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

// Pages principales
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Dashboard from '@/pages/Dashboard';
import HowItWorks from '@/pages/HowItWorks';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Routes principales */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
      </Router>
    </HelmetProvider>
  );
}

export default App;
