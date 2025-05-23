import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/home/Home';
import { Workout } from './pages/workout/Workout';
import { WorkoutForm } from './pages/workout/new';
import { Navbar } from './components/Navbar';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/workout/new" element={<WorkoutForm />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
