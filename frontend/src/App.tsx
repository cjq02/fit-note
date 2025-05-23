import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Home } from './pages/home/Home';
import { Profile } from './pages/profile/Profile';
import { Workout } from './pages/workout/Workout';
import { WorkoutForm } from './pages/workout/WorkoutForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/workout/new" element={<WorkoutForm />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
