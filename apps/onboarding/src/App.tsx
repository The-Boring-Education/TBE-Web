import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Onboarding from "./pages/Onboarding";
import {
  initGA,
  installGlobalListeners,
  trackPageview,
} from "./utils/analytics";

function RouterAnalytics() {
  const location = useLocation();
  useEffect(() => {
    initGA();
    installGlobalListeners();
  }, []);
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RouterAnalytics />
      <Routes>
        <Route path="/" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
