import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { NavButton } from './components/NavButton';
import { CookieBanner } from './components/CookieBanner';

import { MapPage } from './pages/MapPage';
import { TechStackPage } from './pages/TechStackPage';

const CONSENT_KEY = 'cookieConsent';

const App = () => {
  const [consented, setConsented] = useState(
    () => !!localStorage.getItem(CONSENT_KEY),
  );

  return (
    <>
      <NavButton />
      <Routes>
        <Route
          path='/'
          element={
            <MapPage hideLoadingOverlay={!consented} consented={consented} />
          }
        />
        <Route path='/tech-stack' element={<TechStackPage />} />
      </Routes>

      {!consented && <CookieBanner onAccept={() => setConsented(true)} />}
    </>
  );
};

export { App };
