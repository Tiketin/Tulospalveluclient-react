import React, {useEffect} from 'react'
import {Route, useHistory} from 'react-router-dom'

import Login from './components/Login'
import Register from './components/Register'
import Menu from './components/Menu'
import Settings from './components/Settings'
import NewGame from './components/NewGame'
import Statistics from './components/Statistics'
import Players from './components/Players'
import Molkky from './components/Molkky'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import * as path from 'path';

const App = () => {
  const history = useHistory();

  useEffect(() => {
    history.push("/login")
  })

  return (
      <div className="container">
        <Route path="/login" component={Login}/>
        <Route path="/menu" component={Menu}/>
        <Route path="/settings" component={Settings}/>
        <Route path="/newgame" component={NewGame}/>
        <Route path="/statistics" component={Statistics}/>
        <Route path="/players" component={Players}/>
        <Route path="/molkky" component={Molkky}/>
        <Route path="/register" component={Register}/>

      </div>
  )
}

export default App
