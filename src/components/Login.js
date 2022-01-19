import React, {useRef, useState} from 'react';
import {Container, Form, FormText} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';
import '../Styles.css';
import { useEffect } from 'react';

const Login = () => {

  /**
   * @author Henrik Aho, Onni Lukkarila
   */
  const h1 = useRef();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [validated, setValidated] = useState(false);
  let json;
  let xmlhttp = new XMLHttpRequest();
  let history = useHistory();
  useEffect(() => {
    if(localStorage.getItem("mode") === "dark"){
      document.body.style.backgroundImage = "url('./images/darkmode.jpg')";
      h1.current.style.color = "white";
    }
    else {
      document.body.style.backgroundImage = "url('./images/taustakuva.jpg')";
      h1.current.style.color = "black";
    }
  }, []);
  /**
   * Hankkii ryhmän tunnukset tietokannasta.
   */
  const getGroup = event => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    event.preventDefault();
    event.stopPropagation();

    const userObject = {
      email: newEmail,
      password: newPassword,
    };

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        console.log(xmlhttp.responseText)
        try{
          json = JSON.parse(xmlhttp.responseText);
          console.log(json);
          if (json.numOfRows > 0){ // something found
            setGroup(json);
            handleRoute();
          }
        }
        catch (e){
          console.log(e)
          alert("Ryhmän nimi tai salasana väärin!");
        }
      }
    };
    xmlhttp.open('GET', 'https://rocky-cliffs-72708.herokuapp.com/api/login?group=' + newEmail + '&password=' + newPassword, true);
    xmlhttp.send();
    setValidated(true);
  };

  /**
   * Kirjautuu ryhmän tunnuksilla sisään.
   */
  function setGroup(json) {
    localStorage.setItem('group', json.rows[0].nimi);
    console.log(localStorage.getItem('group'));
  }


  const handleEmailChange = (event) => {
    console.log(event.target.value);
    setNewEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    console.log(event.target.value);
    setNewPassword(event.target.value);
  };


  const handleRoute = () =>{
    history.push("/menu");
  }

  const handleRegister = () =>{
    history.push("/register")
  }

  return (
      <Container>
      <h1 ref={h1}>Tulospalvelu</h1>
        <Form noValidate validated={validated} onSubmit={getGroup}>
          <h2>Kirjaudu sisään ryhmän tunnuksilla</h2>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control type="text" value={newEmail}
                          onChange={handleEmailChange} placeholder="Nimi"
                          required/>
            <Form.Control.Feedback type="invalid">Syötä ryhmän nimi!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control type="password" value={newPassword}
                          onChange={handlePasswordChange} placeholder="Salasana"
                          required/>
            <Form.Control.Feedback type="invalid">Syötä salasana!</Form.Control.Feedback>
          </Form.Group>

          <Button size="me" type="submit" to="/menu" >
            Kirjaudu
          </Button>
        </Form>

        <i>Haluatko luoda uuden ryhmän?</i>
        <Button size="lg" onClick={handleRegister} style={{fontsize: "1em"}}>Rekisteröidy</Button>
      </Container>
  );
};

export default Login;