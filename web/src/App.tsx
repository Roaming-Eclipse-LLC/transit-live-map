import { Route, Routes } from 'react-router-dom';

import { NavButton } from './components/NavButton';

import { MapPage } from './pages/MapPage';
import { TechStackPage } from './pages/TechStackPage';

const App = () => {
  return (
    <>
      <NavButton />
      <Routes>
        <Route path='/' element={<MapPage />} />
        <Route path='/tech-stack' element={<TechStackPage />} />
      </Routes>
    </>
  );
};

export { App };
