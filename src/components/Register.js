import React, {useRef, useState} from 'react';
import {Container, Form} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';
import '../Styles.css';
import { useEffect } from 'react';


const Register = () => {

  /**
   * @author Onni Lukkarila, Nikke Tikka
   */
  const h1 = useRef();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
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
  const getGroup = (event) => {

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

  /**
   * Luo uuden ryhmän.
   */
  const newGroup = (event) =>  {
    event.preventDefault();
    let body;
      if (newPassword !== newPassword2) {
        alert('Salasanat eivät täsmää!');
      } else {

        body = {'nimi': newEmail, 'salasana': newPassword};
        console.log(body)
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST',
            'https://rocky-cliffs-72708.herokuapp.com/api/newgroup', true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.send(JSON.stringify(body));
        localStorage.setItem('group', newEmail);
        handleRoute();
      }
    }


  const handleEmailChange = (event) => {
    console.log(event.target.value);
    setNewEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    console.log(event.target.value);
    setNewPassword(event.target.value);
  };

  const handlePassword2Change = (event) => {
    console.log(event.target.value);
    setNewPassword2(event.target.value);
  };

  const handleRoute = () =>{
    history.push("/menu");
  }

  const handleLogin = () => {
    history.push("/login")
  }

  return (
      <Container>
        <h1 ref={h1}>Tulospalvelu</h1>
        <Form noValidate validated={validated} onSubmit={newGroup}>
          <h2>Luo uusi ryhmä</h2>
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

          <Form.Group className="mb-3" controlId="formBasicPassword2">
            <Form.Control type="password" value={newPassword2}
                          onChange={handlePassword2Change} placeholder="Salasana uudestaan"
                          required/>
            <Form.Control.Feedback type="invalid">Salasana ei täsmää!</Form.Control.Feedback>
          </Form.Group>

          <Button size="me" type="submit" to="/menu" >
            Rekisteröidy
          </Button>
        </Form>

        <i>Oletko jo luonut ryhmän?</i>
        <Button size="lg" onClick={handleLogin}>Kirjaudu</Button>

      </Container>
  );
};

export default Register;