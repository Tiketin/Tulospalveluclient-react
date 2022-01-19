import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  ButtonToolbar,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';
import '../Styles.css';

let scores;
let strikes;
let playerLost;
let players;
let currentPlayer;
let roundCounter;
let allScores;
let rows;
let playerScoreList
let winner;
let someoneHasWon;

const Molkky = () => {
  const history = useHistory();
  const [nameGrid, setNameGrid] = useState();
  const [scoreGrid, setScoreGrid] = useState();
  const [gameInstruction, setgameInstruction] = useState(
      'Aloita antamalla pelaajan ' + localStorage.getItem('player0') + ' tulos:'
  );
  const [validated, setValidated] = useState(false);
  const [newScore, setNewScore] = useState();
  const [disable, setDisable] = useState(true);
  const scoresEndRef = useRef(null)

  const handleScoreChange = (event) => {
    console.log(event.target.value);
    setNewScore(event.target.value);
  };

  const scrollToBottom = () => {
    scoresEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const showStartGrid = () => {
    setNameGrid('');
    let player;
    let playerAmount = parseInt(localStorage.getItem('playerAmount'));

    scores = [];
    strikes = [];
    playerLost = [];
    players = [];
    currentPlayer = 0;
    roundCounter = 1;
    allScores = [];
    rows = [1];
    playerScoreList = [];
    someoneHasWon = false;


    for (let i = 0; i < playerAmount; i++) {
      player = localStorage.getItem('player' + i);

      if (player !== null) {
        let playerScores = {
            p0: 0,
            p1: 0,
            p2: 0,
            p3: 0,
            p4: 0,
            p5: 0,
            p6: 0,
            p7: 0,
            p8: 0,
            p9: 0,
            p10: 0,
            p11: 0,
            p12: 0
        };
        playerScoreList.push(playerScores);
        players.push(player);
        scores.push(0);
        strikes.push(0);
        playerLost.push(false);
        console.log(playerScoreList[0]['p0'])

      }
    }
    console.log(players);
    setNameGrid(players.map((row) =>
        <Col className="grid-item">{row + ': 0'} </Col>,
    ));
  };

  const updateScore = (playerToUpdate, result) => {
    if (parseInt(result) === 0) {
      strikes[playerToUpdate]++;
    } else {
      scores[playerToUpdate] += parseInt(result);
      strikes[playerToUpdate] = 0;
      switch (parseInt(result)) {
        case 0:
          playerScoreList[playerToUpdate]['p0']++;
          break;
        case 1:
          playerScoreList[playerToUpdate]['p1']++;
          break;
        case 2:
          playerScoreList[playerToUpdate]['p2']++;
          break;
        case 3:
          playerScoreList[playerToUpdate]['p3']++;
          break;
        case 4:
          playerScoreList[playerToUpdate]['p4']++;
          break;
        case 5:
          playerScoreList[playerToUpdate]['p5']++;
          break;
        case 6:
          playerScoreList[playerToUpdate]['p6']++;
          break;
        case 7:
          playerScoreList[playerToUpdate]['p7']++;
          break;
        case 8:
          playerScoreList[playerToUpdate]['p8']++;
          break;
        case 9:
          playerScoreList[playerToUpdate]['p9']++;
          break;
        case 10:
          playerScoreList[playerToUpdate]['p10']++;
          break;
        case 11:
          playerScoreList[playerToUpdate]['p11']++;
          break;
        case 12:
          playerScoreList[playerToUpdate]['p12']++;
          break;
        default: break;
      }
    }

    if (scores[playerToUpdate] === 50) {
      if(!someoneHasWon) winnerFound();
      else alert(players[currentPlayer] + ' saavutti 50 pistettä!')
    } else if (scores[playerToUpdate] > 50) {
      scores[playerToUpdate] = 25;
    } else if (strikes[playerToUpdate] >= 3) {
      playerLost[playerToUpdate] = true;
    }



    console.log(playerScoreList)
    setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i] + ': ' + scores[i]}</Col>));
  };

  const addNewScore = (event) => {

    event.preventDefault();
    let score;
    score = newScore;

    if (score > 12 || score < 0) {
      alert('Anna tulos väliltä 0-12!');
    } else {
      allScores.push(score)
      updateScore(currentPlayer, score);
      setScoreGrid(rows.map((row) =>
              <Row>
                {scores.map((score, i) =>
                    <Col className="grid-item" id={row + "" + i}>{allScores[(row - 1) * players.length + i]}</Col>)}
              </Row>
          )
      );
      currentPlayer++;
      if (currentPlayer === players.length) {
        currentPlayer = 0;
        roundCounter++;
        rows.push(roundCounter);
      }
    }

    while(playerLost[currentPlayer] === true) {
      allScores.push('X');
      setScoreGrid(rows.map((row) =>
              <Row>
                {scores.map((score, i) =>
                    <Col className="grid-item" id={row + "" + i}>{allScores[(row - 1) * players.length + i]}</Col>)}
              </Row>
          )
      );
      currentPlayer++;
    }
    setgameInstruction('Anna pelaajan ' + players[currentPlayer] + ' tulos:')
    scrollToBottom();
  };

  const winnerFound = () => {
    winner = players[currentPlayer];
    someoneHasWon = true;
    setDisable(false)
    alert(players[currentPlayer] + " voitti pelin!");
  };

  const saveGame = () => {
    if(window.confirm("Haluatko tallentaa pelin tietokantaan")) {

      let body = {};

      for (let i = 0; i < players.length; i++) {
        let tempPlayer = "pelaaja" + (i + 1);

        body[tempPlayer] =
            {
              "nimi": players[i],
              "p0": playerScoreList[i]['p0'],
              "p1": playerScoreList[i]['p1'],
              "p2": playerScoreList[i]['p2'],
              "p3": playerScoreList[i]['p3'],
              "p4": playerScoreList[i]['p4'],
              "p5": playerScoreList[i]['p5'],
              "p6": playerScoreList[i]['p6'],
              "p7": playerScoreList[i]['p7'],
              "p8": playerScoreList[i]['p8'],
              "p9": playerScoreList[i]['p9'],
              "p10": playerScoreList[i]['p10'],
              "p11": playerScoreList[i]['p11'],
              "p12": playerScoreList[i]['p12'],
            };
        console.log("pelaaja tallennettu objektiin");
      }

      console.log(winner)
      body["ryhman_nimi"] = localStorage.getItem('group');
      body["voittajan_nimi"] = winner;

      let today = new Date();
      body["pvm"] = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" +
          today.getDate();

      console.log(body);

      let xmlhttp = new XMLHttpRequest();
      xmlhttp.open("POST",
          "https://rocky-cliffs-72708.herokuapp.com/api/newgame", true);
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(JSON.stringify(body));
      alert("Peli tallennettu!");
      setDisable(true);
    }

  }

  const endGame = () => {
    if(window.confirm("Haluatko lopettaa pelin?")) history.push("/menu");
  }

  useEffect(() => {
    showStartGrid();
  }, []);

  return (
      <Container className="my-auto">
        <h1>Mölkky</h1>
        <Container className="grid-container">
          <Row>
            {nameGrid}
          </Row>
        </Container>
        <Container className="grid-container">
          {scoreGrid}
          <div ref={scoresEndRef}/>
        </Container>
        <Form noValidate validated={validated} onSubmit={addNewScore}>
          <Col xs="auto">
            <Form.Label style={{fontWeight: "bold"}}>{gameInstruction}</Form.Label>
          </Col>
          <Col xs="auto">
            <Form.Control type="text"
                          value={newScore}
                          onChange={handleScoreChange}
                          placeholder="0-12"
                          required>
            </Form.Control>
          </Col>
          <Col xs="auto">
            <Button variant="primary"
                    type="submit"
                    size="sm">Lisää tulos
            </Button>
          </Col>
        </Form>
        <ButtonToolbar>
          <Button style={{margin: "0.1em"}} size="me" onClick={saveGame} disabled={disable}>Tallenna</Button>
          <Button style={{margin: "0.1em"}} size="me" onClick={endGame}>Lopeta</Button>
        </ButtonToolbar>
      </Container>
  );
};
export default Molkky;