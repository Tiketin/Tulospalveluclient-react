import {Container, Form, FormText} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import '../Styles.css';
import React, {useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const NewGame = () => {
    const h1 = useRef();
  const navigate = useNavigate();
  const handleSettings = () => {
    navigate('/menu')
  }

  const handleMolkky = () => {
    navigate('/players')
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
      <Container>
        <h1 ref={h1}>Valitse Peli</h1>
        <ButtonGroup Vertical className="buttonGroup">
          <Button size="lg" onClick={handleMolkky}>Mölkky</Button>
          <Button size="lg">Ristiseiska</Button>
          <Button size="lg" onClick={handleSettings}>Takaisin</Button>
        </ButtonGroup>
      </Container>
  );
};
export default NewGame;