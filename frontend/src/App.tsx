import { TabBar } from 'antd-mobile';
import { AppOutline, UnorderedListOutline, UserOutline } from 'antd-mobile-icons';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { Home } from './pages/home/Home';
import { Profile } from './pages/profile/Profile';
import { ProjectList } from './pages/project/ProjectList';
import { Workout } from './pages/workout/Workout';
import { WorkoutForm } from './pages/workout/WorkoutForm';

const tabs = [
  {
    key: '/',
    title: '首页',
    icon: <AppOutline />,
  },
  {
    key: '/workout',
    title: '训练',
    icon: <UnorderedListOutline />,
  },
  {
    key: '/profile',
    title: '我的',
    icon: <UserOutline />,
  },
];

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-[var(--adm-tab-bar-height)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/workout/new" element={<WorkoutForm />} />
          <Route path="/workout/edit/:id" element={<WorkoutForm />} />
          <Route path="/project" element={<ProjectList />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={value => navigate(value)}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--adm-color-border)]"
      >
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};
