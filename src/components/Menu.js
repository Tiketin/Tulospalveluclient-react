import {Container, Form, FormText} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import '../Styles.css';
import React, {useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const Menu = () => {
  const h1 = useRef();
  const navigate = useNavigate();
  const handleSettings = () => {
    navigate('/settings')
  }

  const handleNewGame = () => {
    navigate('/newgame')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleStatistics = () => {
    navigate('/statistics')
  }
  /**
   * Checks the current mode and makes changes if necessary
   */
  useEffect(() => {
    if(localStorage.getItem("mode") === "dark"){
      document.body.style.backgroundImage = "url('/images/darkmode.jpg')";
      h1.current.style.color = "white";
    }
    else {
      document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
      h1.current.style.color = "black";
    }
  }, []);


  return (
      <Container className="my-auto">
        <h1 ref={h1}>Ryhmä: {localStorage.getItem('group')}</h1>
        <ButtonGroup Vertical className="buttonGroup">

          <Button onClick={handleNewGame} size="lg">Uusi Peli</Button>
          <Button onClick={handleStatistics} size="lg">Statistiikka</Button>
          <Button onClick={handleSettings} size="lg">Asetukset</Button>
          <Button onClick={handleLogin} size="lg">Kirjaudu Ulos</Button>


        </ButtonGroup>
      </Container>
  );
};
export default Menu;