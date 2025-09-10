import React, {useEffect} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Menu from './components/Menu';
import Settings from './components/Settings';
import NewGame from './components/NewGame';
import Statistics from './components/Statistics';
import Players from './components/Players';
import Molkky from './components/Molkky';
import MolkkyPlayerOrder from './components/MolkkyPlayerOrder';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/#") {
      console.log("Build ID:", process.env.REACT_APP_BUILD_ID);
      navigate("/login");
    }
  }, [location.pathname]);

  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/newgame" element={<NewGame />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/players" element={<Players />} />
        <Route path="/molkkyplayerorder" element={<MolkkyPlayerOrder />} />
        <Route path="/molkky" element={<Molkky />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App
