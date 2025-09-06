import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  ButtonToolbar,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import '../Styles.css';
import InputValidator from '../utils/InputValidator';

const apiUrl = process.env.REACT_APP_API_URL;

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
let shortenNames;

const Molkky = () => {
  const h1 = useRef();
  const navigate = useNavigate();
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
    scoresEndRef.current?.scrollIntoView({ behavior: "smooth" });
    window.scroll(0, 0);
  }

  const showStartGrid = () => {
    setNameGrid('');
    let player;
    let playerAmount = parseInt(localStorage.getItem('playerAmount'));
    shortenNames = playerAmount > 5;

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
    if (shortenNames) {
      setNameGrid(players.map((row) =>
        <Col className="grid-item">{row.substring(0,3)}<br/>0</Col>,
      ));
    } else {
      setNameGrid(players.map((row) =>
        <Col className="grid-item">{row}<br/>0</Col>,
      ));
    } 
  };

  const updateScore = (playerToUpdate, result) => {
    if (parseInt(result) === 0) {
      strikes[playerToUpdate]++;
    } else {
      strikes[playerToUpdate] = 0;
    }
    scores[playerToUpdate] += parseInt(result);
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

    if (scores[playerToUpdate] === 50) {
      if(!someoneHasWon) winnerFound();
      else alert(players[currentPlayer] + ' saavutti 50 pistettä!')
    } else if (scores[playerToUpdate] > 50) {
      scores[playerToUpdate] = 25;
    } else if (strikes[playerToUpdate] >= 3) {
      playerLost[playerToUpdate] = true;
    }



    console.log(playerScoreList)
    if (shortenNames) {
      setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i].substring(0,3)}<br/>{scores[i]}</Col>));
    } else {
      setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i]}<br/>{scores[i]}</Col>));
    }
  };

  const addNewScore = (newScore) => {
    console.log("Adding score:", newScore, typeof newScore);
    let score = newScore;
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
      if (currentPlayer === players.length) {
        currentPlayer = 0;
        roundCounter++;
        rows.push(roundCounter);
      }
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
          apiUrl + "/api/newgame", true);
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(JSON.stringify(body));
      alert("Peli tallennettu!");
      setDisable(true);
    }

  }

  const endGame = () => {
    if(window.confirm("Haluatko lopettaa pelin?")) navigate("/menu");
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
    showStartGrid();
    window.scroll(0, 0);
  }, []);

  return (
      <Container className="my-auto">
        <h1 ref={h1}>Mölkky</h1>
        <Container className="grid-container">
          <Row>
            {nameGrid}
          </Row>
        </Container>
        <Container className="grid-container">
          {scoreGrid}
          <div ref={scoresEndRef}/>
        </Container>
        <Container className='molkkyButtonContainer'>
          <Row className='molkkyButtonRow'>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(7)}>7</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(9)}>9</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(8)}>8</Button></div>
          </Row>
          <Row className='molkkyButtonRow'>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(5)}>5</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(11)}>11</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(12)}>12</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(6)}>6</Button></div>
          </Row>
          <Row className='molkkyButtonRow'>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(3)}>3</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(10)}>10</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(4)}>4</Button></div>
          </Row>
          <Row className='molkkyButtonRow'>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(1)}>1</Button></div>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(2)}>2</Button></div>
          </Row>
          <Row className='molkkyButtonRow'>
            <div className="col"><Button className='molkkyButton' onClick={() => addNewScore(0)}>OHI</Button></div>
          </Row> 
        </Container>
        <ButtonToolbar className='molkkyButtonToolBar'>
          <Button style={{margin: "0.1em"}} size="me" onClick={saveGame} disabled={disable}>Tallenna</Button>
          <Button style={{margin: "0.1em"}} size="me" onClick={endGame}>Lopeta</Button>
        </ButtonToolbar>
      </Container>
  );
};
export default Molkky;