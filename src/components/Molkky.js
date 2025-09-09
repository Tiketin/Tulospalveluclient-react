import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  ButtonToolbar,
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import '../Styles.css';

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

  const navigate = useNavigate();
  const [nameGrid, setNameGrid] = useState();
  const [scoreGrid, setScoreGrid] = useState();
  const [gameInstruction, setgameInstruction] = useState(
      'Vuorossa: ' + localStorage.getItem('player0'));
  const [disable, setDisable] = useState(true);
  const scoresEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom();
  }, [scoreGrid]);

  const scrollToBottom = () => {
    scoresEndRef.current?.scrollIntoView({ behavior: "smooth" });
    window.scroll(0, 0);
  };

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
      }
    }
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
    const point = `p${parseInt(result)}`;
    playerScoreList[playerToUpdate][point]++;
    if (scores[playerToUpdate] === 50) {
      if(!someoneHasWon) winnerFound();
      else alert(players[currentPlayer] + ' saavutti 50 pistettä!');
    } else if (scores[playerToUpdate] > 50) {
      scores[playerToUpdate] = 25;
    } else if (strikes[playerToUpdate] >= 3) {
      playerLost[playerToUpdate] = true;
    }

    if (shortenNames) {
      setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i].substring(0,3)}<br/>{scores[i]}</Col>));
    } else {
      setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i]}<br/>{scores[i]}</Col>));
    }
  };
  
  const removeScore = (playerToUpdate, result) => {
    if (parseInt(result) === 0) {
      strikes[playerToUpdate]--;
      if (playerLost[playerToUpdate] === true) {
        playerLost[playerToUpdate] = false;
      }
    }
    scores[playerToUpdate] -= parseInt(result);
    const point = `p${parseInt(result)}`;
    playerScoreList[playerToUpdate][point]--;

    if(someoneHasWon && winner === players[currentPlayer]) {
      winner = null;
      someoneHasWon = false;
      setDisable(true)
    } 

    if (shortenNames) {
      setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i].substring(0,3)}<br/>{scores[i]}</Col>));
    } else {
      setNameGrid(scores.map((row, i) =>
        <Col className="grid-item">{players[i]}<br/>{scores[i]}</Col>));
    }
  };

  const addNewScore = (newScore) => {
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
    setgameInstruction('Vuorossa: ' + players[currentPlayer]);
  };

  const backToPreviousScore = () => {
    //If no scores to remove, stop
    if (allScores.length === 0) return;

    // Get the last score before removing it
    let lastScore = allScores[allScores.length - 1];
    if(lastScore === 'X') {
      allScores.pop();
      currentPlayer--;
      if(currentPlayer < 0) {
        //Player length is one higher than last index
        currentPlayer = players.length - 1;
        roundCounter--;
        rows.pop();
      }
      lastScore = allScores[allScores.length - 1];
    }
    allScores.pop();
    currentPlayer--;
    if(currentPlayer < 0) {
      currentPlayer = players.length - 1;
      roundCounter--;
      rows.pop();
    }

    removeScore(currentPlayer, lastScore);

    //Handle case where player was marked lost
    while (playerLost[currentPlayer] === true && allScores.length > 0) {
      allScores.pop();
      currentPlayer--;
      if (currentPlayer < 0) {
        currentPlayer = players.length - 1;
        roundCounter--;
        rows.pop();
      }
    }
    //Rebuild score grid
    setScoreGrid(
      rows.map((row) => (
        <Row>
          {scores.map((score, i) => (
            <Col className="grid-item" id={row + "" + i}>
              {allScores[(row - 1) * players.length + i]}
            </Col>
          ))}
        </Row>
      ))
    );

    setgameInstruction("Vuorossa: " + players[currentPlayer]);
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
      }

      body["ryhman_nimi"] = localStorage.getItem('group');
      body["voittajan_nimi"] = winner;

      let today = new Date();
      body["pvm"] = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" +
          today.getDate();

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
    }
    else {
      document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
    }
    showStartGrid();
    window.scroll(0, 0);
  }, []);

  return (
      <Container className="my-auto">
        <Container className="nameRow">
          <Row>
            {nameGrid}
          </Row>
        </Container>
        <Container className="grid-container">
          {scoreGrid}
          <div ref={scoresEndRef}/>
        </Container>
        <Container className='molkkyButtonContainer'>
          <h3>{gameInstruction}</h3>
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
            <div className="col"><Button className='molkkyButtonWide' onClick={() => backToPreviousScore()}>Peruuta</Button></div>
            <div className="col"><Button className='molkkyButtonWide' onClick={() => addNewScore(0)}>- Ohi -</Button></div>
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