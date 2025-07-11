import {Col, Container, Form, FormText, Row, Table} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import '../Styles.css';
import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

/**
 * @author Onni Lukkarila
 */

const apiUrl = process.env.REACT_APP_API_URL;

const Players = () => {
  const h1 = useRef();
  const [newPlayer, setNewPlayer] = useState();
  const [validated, setValidated] = useState(false);
  const [playerTable, setPlayerTable] = useState();
  const navigate = useNavigate();
  const table = useRef();
  const hasFetched = useRef(false);
  let json;
  let players = [];
  let player;


  const handlePlayerChange = (event) => {
    console.log(event.target.value);
    setNewPlayer(event.target.value);
  };


  const getPlayers = () => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        json = JSON.parse(xmlhttp.responseText);
        if (json.numOfRows > 0) { // something found
          console.log('Pelaajia löytyi /players');
          console.log(json);
          for (let i in json.rows) {
            player = {nimi: json.rows[i].nimi, checkbox: false};
            players.push(player);
          }
          setPlayerTable(players.map((row, i) =>
                  <tr id="playersTRow">
                    <td id="playersTableName">{row.nimi}</td>
                    <td id="playersTableCB">
                      <input className="form-check-input" type="checkbox"
                             id={"checkbox" + i} defaultChecked={row.checkbox}
                             onClick={() => row.checkbox = !row.checkbox}/>
                    </td>
                  </tr>
          ))
        } else {
          alert('Pelaajia ei löytynyt!');
        }
      }

    };
    xmlhttp.open('GET',
        apiUrl + '/api/players?group=' +
        localStorage.getItem('group'), true);
    xmlhttp.send();
  };


  const addNewPlayer = (event) => {
    event.preventDefault()
    let player = newPlayer;
    let group = localStorage.getItem('group');
    let body;
    if (player === null || player === '') {
      alert('Kirjoita pelaajan nimi!');
    } else {
      body = {'pelaajan_nimi': player, 'ryhman_nimi': group};
      console.log(body);
      let xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST',
          apiUrl + '/api/newplayer', true);
      xmlhttp.setRequestHeader('Content-Type', 'application/json');
      xmlhttp.send(JSON.stringify(body));
      setTimeout(function() {
        getPlayers()
      }, 1000);
    }
  };

  const handleMolkkyGame = () => {
    let playerAmount = 0;
    let playersToAdd = [];
    let rows = table.current.rows;
    for (let i = 0; i<rows.length; i++){
      localStorage.removeItem("player" + i);
      if(rows[i].children[1].children[0].checked === true){
        playersToAdd.push(rows[i].children[0].innerText)
        playerAmount++;
      }
    }
    for (let i in playersToAdd){

      localStorage.setItem("player" + i, playersToAdd[i]);
    }
    localStorage.setItem("playerAmount", playerAmount.toString());
    navigate('/molkky');
  };

  const handleBack = () =>{
    navigate("/newgame")
  }

  useEffect(() => {
    if(localStorage.getItem("mode") === "dark"){
      document.body.style.backgroundImage = "url('/images/darkmode.jpg')";
      h1.current.style.color = "white";
    }
    else {
      document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
      h1.current.style.color = "black";
    }
    if (!hasFetched.current) {
    getPlayers();
    hasFetched.current = true;
    }
  }, []);

  return (
      <Container>
        <h1 ref={h1}>Valitse pelaajat</h1>
        <Form noValidate validated={validated} onSubmit={addNewPlayer}>
          <Row className="align-items-center">
            <Col xs="auto">
              <Form.Control type="text" value={newPlayer}
                            onChange={handlePlayerChange}>
              </Form.Control>
            </Col>
            <Col xs="auto">
              <Button variant="primary" type="submit" size="sm">Lisää</Button>
            </Col>
          </Row>
          <Table striped responsive size="sm" id="playerTable">
            <thead>
            <tr>
              <th>Tallennetut pelaajat</th>
            </tr>
            </thead>
            <tbody ref={table}>
            {playerTable}
            </tbody>
          </Table>
          <Button onClick={handleMolkkyGame} size="sm">Aloita peli</Button>
        </Form>

        <Button size="lg" onClick={handleBack}>Takaisin</Button>

      </Container>
  );
};
export default Players;