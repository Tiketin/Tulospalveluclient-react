import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonToolbar, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../Styles.css';
import MolkkyPlayerScore from '../utils/MolkkyPlayerScore';
import Team from '../utils/Team';
import { API_URL } from '../config';

const STORAGE_KEY = 'molkky_active_game_state';

export const clearGameState = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const Molkky = () => {
  const navigate = useNavigate();
  const [nameGrid, setNameGrid] = useState(null);
  const [scoreGrid, setScoreGrid] = useState(null);
  const [gameInstruction, setGameInstructionText] = useState('');
  const [disable, setDisable] = useState(true);
  const [gameEnded, setGameEnded] = useState(true);

  const scoresEndRef = useRef(null);
  const h3 = useRef(null);

  const stateRef = useRef({
    scores: [],
    strikes: [],
    playerLost: [],
    players: [],
    currentPlayer: 0,
    roundCounter: 1,
    allScores: [],
    rows: [1],
    playerScoreList: [],
    winner: null,
    someoneHasWon: false,
    shortenNames: false,
    molkkyPlayerScores: [],
    isTeamGame: false,
    teams: [],
    individualMemberStats: {}
  });

  useEffect(() => {
    scrollToBottom();
  }, [scoreGrid]);

  const scrollToBottom = () => {
    scoresEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const formatTeamDisplayName = (team) => {
    if (!team || !team.members || !team.members.length) return team ? team.name : '';
    return team.members
      .map((member) => member.trim().substring(0, 2))
      .filter((prefix) => prefix.length > 0)
      .join(' & ');
  };

  const getTeamsFromStorage = () => {
    const savedTeamsJson = localStorage.getItem("molkky_teams");
    if (!savedTeamsJson) return [];
    try {
      const rawTeams = JSON.parse(savedTeamsJson);
      return rawTeams.map((rawTeam) => new Team(rawTeam));
    } catch (error) {
      console.error("Failed to parse teams from localStorage:", error);
      return [];
    }
  };

  const saveGameState = () => {
    try {
      const state = stateRef.current;
      const serializableState = {
        ...state,
        molkkyPlayerScores: state.molkkyPlayerScores.map((p) => ({
          player: p.player,
          scores: p.scores || []
        }))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
    } catch (e) {
      console.error('Failed to save game state to local storage:', e);
    }
  };

  const updateGameInstruction = () => {
    const { players, currentPlayer, molkkyPlayerScores, isTeamGame, teams } = stateRef.current;
    if (!players || !players.length || !molkkyPlayerScores[currentPlayer]) return;

    const currentScore = molkkyPlayerScores[currentPlayer].returnScore();
    const neededScore = 50 - currentScore;

    const teamOrPlayerName = players[currentPlayer];
    const currentMemberText = isTeamGame && teams[currentPlayer]
      ? ` (${teams[currentPlayer].returnCurrentPlayer()})`
      : '';

    if (neededScore <= 12) {
      setGameInstructionText(`Vuorossa: ${teamOrPlayerName}${currentMemberText} (${neededScore})`);
    } else {
      setGameInstructionText(`Vuorossa: ${teamOrPlayerName}${currentMemberText}`);
    }
  };

  const handleInstructionClick = () => {
    const state = stateRef.current;
    if (state.isTeamGame && state.teams[state.currentPlayer]) {
      state.teams[state.currentPlayer].nextPlayer();
      renderGrids();
      updateGameInstruction();
      saveGameState();
    }
  };

  const renderGrids = () => {
    const { players, scores, rows, allScores, shortenNames } = stateRef.current;

    setNameGrid(
      <>
        <Col className="grid-item round-header" key="round-header" xs={2} sm={1}>
          #
        </Col>
        {scores.map((score, i) => {
          const displayName = shortenNames ? players[i].substring(0, 3) : players[i];

          return (
            <Col className="grid-item" key={`name-${i}`}>
              {displayName}
              <br />
              <strong>{scores[i]}</strong>
            </Col>
          );
        })}
      </>
    );

    setScoreGrid(
      rows.map((row) => (
        <Row className="scoreRow" key={`row-${row}`}>
          <Col className="grid-item round-cell" key={`round-${row}`} xs={2} sm={1}>
            {row}
          </Col>
          {scores.map((_, i) => (
            <Col className="grid-item" id={`${row}${i}`} key={`cell-${row}-${i}`}>
              {allScores[(row - 1) * players.length + i]}
            </Col>
          ))}
        </Row>
      ))
    );
  };

  const createEmptyStatsObj = () => ({
    p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0,
    p6: 0, p7: 0, p8: 0, p9: 0, p10: 0, p11: 0, p12: 0
  });

  const showStartGrid = () => {
    const playerAmount = parseInt(localStorage.getItem('playerAmount') || '0', 10);
    const isTeamGame = localStorage.getItem("teamGame") === "true";
    const shortenNames = playerAmount > 5 && !isTeamGame;
    const players = [];
    const scores = [];
    const strikes = [];
    const playerLost = [];
    const playerScoreList = [];
    const molkkyPlayerScores = [];


    let loadedTeams = [];
    const individualMemberStats = {};

    if (isTeamGame) {
      loadedTeams = getTeamsFromStorage();
      for (let i = 0; i < loadedTeams.length; i++) {
        // Generate formatted display name: "Nikke" + "Onni" -> "Ni & On"
        const formattedTeamName = formatTeamDisplayName(loadedTeams[i]);
        
        molkkyPlayerScores.push(new MolkkyPlayerScore(formattedTeamName));
        playerScoreList.push(createEmptyStatsObj());
        players.push(formattedTeamName);
        scores.push(0);
        strikes.push(0);
        playerLost.push(false);

        loadedTeams[i].members.forEach((member) => {
          individualMemberStats[member] = createEmptyStatsObj();
        });
      }
    } else {
      for (let i = 0; i < playerAmount; i++) {
        const player = localStorage.getItem(`player${i}`);
        if (player !== null) {
          molkkyPlayerScores.push(new MolkkyPlayerScore(player));
          playerScoreList.push(createEmptyStatsObj());
          players.push(player);
          scores.push(0);
          strikes.push(0);
          playerLost.push(false);
        }
      }
    }

    stateRef.current = {
      scores,
      strikes,
      playerLost,
      players,
      currentPlayer: 0,
      roundCounter: 1,
      allScores: [],
      rows: [1],
      playerScoreList,
      winner: null,
      someoneHasWon: false,
      shortenNames,
      molkkyPlayerScores,
      isTeamGame,
      teams: loadedTeams,
      individualMemberStats
    };

    setGameEnded(false);
    renderGrids();
    updateGameInstruction();
    saveGameState();
  };

  const winnerFound = () => {
    const { players, currentPlayer } = stateRef.current;
    stateRef.current.winner = players[currentPlayer];
    stateRef.current.someoneHasWon = true;
    setDisable(false);
    alert(`${players[currentPlayer]} voitti pelin!`);
  };

  const updateScore = (playerToUpdate, result) => {
    const state = stateRef.current;
    const numResult = parseInt(result, 10);

    state.molkkyPlayerScores[state.currentPlayer].addScore(numResult);
    state.strikes[playerToUpdate] = state.molkkyPlayerScores[state.currentPlayer].returnStrikes();
    state.scores[playerToUpdate] = state.molkkyPlayerScores[state.currentPlayer].returnScore();

    const point = `p${numResult}`;
    state.playerScoreList[playerToUpdate][point]++;

    if (state.isTeamGame && state.teams[playerToUpdate]) {
      const activeMember = state.teams[playerToUpdate].returnCurrentPlayer();
      if (activeMember && state.individualMemberStats[activeMember]) {
        state.individualMemberStats[activeMember][point]++;
      }
    }

    if (state.scores[playerToUpdate] === 50) {
      if (!state.someoneHasWon) winnerFound();
      else alert(`${state.players[state.currentPlayer]} saavutti 50 pistettä!`);
    } else if (state.strikes[playerToUpdate] >= 3) {
      state.playerLost[playerToUpdate] = true;
    }

    renderGrids();
  };

  const removeScore = (playerToUpdate, result) => {
    const state = stateRef.current;
    const numResult = parseInt(result, 10);

    if (numResult === 0 && state.playerLost[playerToUpdate]) {
      state.playerLost[playerToUpdate] = false;
    }

    state.molkkyPlayerScores[state.currentPlayer].removeScore();
    state.strikes[playerToUpdate] = state.molkkyPlayerScores[state.currentPlayer].returnStrikes();
    state.scores[playerToUpdate] = state.molkkyPlayerScores[state.currentPlayer].returnScore();

    const point = `p${numResult}`;
    state.playerScoreList[playerToUpdate][point]--;

    if (state.isTeamGame && state.teams[playerToUpdate]) {
      const activeMember = state.teams[playerToUpdate].returnCurrentPlayer();
      if (activeMember && state.individualMemberStats[activeMember]) {
        state.individualMemberStats[activeMember][point]--;
      }
    }

    if (state.someoneHasWon && state.winner === state.players[state.currentPlayer]) {
      state.winner = null;
      state.someoneHasWon = false;
      setDisable(true);
    }

    renderGrids();
  };

  const addNewScore = (newScore) => {
    const state = stateRef.current;
    state.allScores.push(newScore);

    updateScore(state.currentPlayer, newScore);

    if (state.isTeamGame && state.teams[state.currentPlayer]) {
      state.teams[state.currentPlayer].nextPlayer();
    }

    state.currentPlayer++;
    if (state.currentPlayer === state.players.length) {
      state.currentPlayer = 0;
      state.roundCounter++;
      state.rows.push(state.roundCounter);
    }

    let playersChecked = 0;
    while (
      state.playerLost[state.currentPlayer] ||
      state.molkkyPlayerScores[state.currentPlayer].returnScore() === 50
    ) {
      if (playersChecked === state.players.length) {
        alert('Peli on päättynyt!');
        setGameEnded(true);
        break;
      }

      state.allScores.push(state.playerLost[state.currentPlayer] ? 'X' : 'V');

      state.currentPlayer++;
      if (state.currentPlayer === state.players.length) {
        state.currentPlayer = 0;
        state.roundCounter++;
        state.rows.push(state.roundCounter);
      }
      playersChecked++;
    }

    renderGrids();
    updateGameInstruction();
    saveGameState();
  };

  const backToPreviousScore = () => {
    const state = stateRef.current;
    if (state.allScores.length === 0) return;

    let lastScore = state.allScores[state.allScores.length - 1];

    if (lastScore === 'X' || lastScore === 'V') {
      state.allScores.pop();
      state.currentPlayer--;
      if (state.currentPlayer < 0) {
        state.currentPlayer = state.players.length - 1;
        state.roundCounter--;
        state.rows.pop();
      }
      lastScore = state.allScores[state.allScores.length - 1];
    }

    state.allScores.pop();
    state.currentPlayer--;
    if (state.currentPlayer < 0) {
      state.currentPlayer = state.players.length - 1;
      state.roundCounter--;
      state.rows.pop();
    }

    if (state.isTeamGame && state.teams[state.currentPlayer]) {
      state.teams[state.currentPlayer].previousPlayer();
    }

    removeScore(state.currentPlayer, lastScore);

    while (state.playerLost[state.currentPlayer] && state.allScores.length > 0) {
      state.allScores.pop();
      state.currentPlayer--;
      if (state.currentPlayer < 0) {
        state.currentPlayer = state.players.length - 1;
        state.roundCounter--;
        state.rows.pop();
      }
    }

    renderGrids();
    updateGameInstruction();
    saveGameState();
  };

  const saveGame = () => {
    if (!window.confirm('Haluatko tallentaa pelin tietokantaan')) return;

    const { players, playerScoreList, winner, isTeamGame, teams, individualMemberStats } = stateRef.current;
    const body = {};
    let winnerPlayers = [];

    if (isTeamGame) {
      let counter = 1;
      Object.keys(individualMemberStats).forEach((memberName) => {
        body[`pelaaja${counter}`] = {
          nimi: memberName,
          ...individualMemberStats[memberName]
        };
        counter++;
      });

      // Match winning team by formatted name or direct team lookup
      const winningTeamIdx = players.indexOf(winner);
      const winningTeamObj = winningTeamIdx !== -1 ? teams[winningTeamIdx] : null;

      if (winningTeamObj && Array.isArray(winningTeamObj.members)) {
        winnerPlayers = winningTeamObj.members;
      }
    } else {
      for (let i = 0; i < players.length; i++) {
        body[`pelaaja${i + 1}`] = {
          nimi: players[i],
          ...playerScoreList[i]
        };
      }
      if (winner) {
        winnerPlayers = [winner];
      }
    }

    body.ryhman_nimi = localStorage.getItem('group');
    body.voittajat = winnerPlayers;
    body.voittajan_nimi = winnerPlayers[0] || winner;

    const today = new Date();
    body.pvm = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', `${API_URL}/api/newgame`, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.onload = () => {
      if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
        alert('Peli tallennettu!');
        clearGameState();
        setDisable(true);
      } else {
        alert(`Virhe tallennuksessa: ${xmlhttp.responseText}`);
      }
    };
    xmlhttp.onerror = () => {
      alert('Tietokantayhteys epäonnistui!');
    };
    xmlhttp.send(JSON.stringify(body));
  };

  const endGame = () => {
    if (window.confirm('Haluatko lopettaa pelin?')) {
      clearGameState();
      navigate('/menu');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('mode') === 'dark') {
      document.body.style.backgroundImage = "url('/images/darkmode.jpg')";
      if (h3.current) h3.current.style.color = 'white';
    } else {
      document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
      if (h3.current) h3.current.style.color = 'black';
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedState = JSON.parse(savedData);

        parsedState.molkkyPlayerScores = parsedState.molkkyPlayerScores.map((data) => {
          const instance = new MolkkyPlayerScore(data.player);
          instance.scores = Array.isArray(data.scores) ? data.scores : [];
          return instance;
        });

        if (parsedState.isTeamGame && Array.isArray(parsedState.teams)) {
          parsedState.teams = parsedState.teams.map((t) => new Team(t));
        }

        stateRef.current = parsedState;
        setGameEnded(false);
        if (parsedState.someoneHasWon) setDisable(false);

        renderGrids();
        updateGameInstruction();
      } catch (e) {
        console.error('Error loading saved state, starting fresh:', e);
        showStartGrid();
      }
    } else {
      showStartGrid();
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Container className="my-auto">
      <Container className="nameRow">
        <Row>{nameGrid}</Row>
      </Container>
      <Container className="grid-container">
        {scoreGrid}
        <div ref={scoresEndRef} />
      </Container>
      <Container className="molkkyButtonContainer">
        <h3
          ref={h3}
          onClick={handleInstructionClick}
          style={stateRef.current.isTeamGame ? { cursor: 'pointer', userSelect: 'none' } : {}}
          title={stateRef.current.isTeamGame ? 'Vaihda heittäjää napauttamalla' : ''}
        >
          {gameInstruction}
        </h3>
        <Row className="molkkyButtonRow">
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(7)} disabled={gameEnded}>7</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(9)} disabled={gameEnded}>9</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(8)} disabled={gameEnded}>8</Button></div>
        </Row>
        <Row className="molkkyButtonRow">
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(5)} disabled={gameEnded}>5</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(11)} disabled={gameEnded}>11</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(12)} disabled={gameEnded}>12</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(6)} disabled={gameEnded}>6</Button></div>
        </Row>
        <Row className="molkkyButtonRow">
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(3)} disabled={gameEnded}>3</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(10)} disabled={gameEnded}>10</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(4)} disabled={gameEnded}>4</Button></div>
        </Row>
        <Row className="molkkyButtonRowLast">
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(1)} disabled={gameEnded}>1</Button></div>
          <div className="col"><Button className="molkkyButton" onClick={() => addNewScore(2)} disabled={gameEnded}>2</Button></div>
        </Row>
        <Row className="molkkyButtonRow">
          <div className="col"><Button className="molkkyButtonWide" onClick={backToPreviousScore} disabled={gameEnded}>Peruuta</Button></div>
          <div className="col"><Button className="molkkyButtonWide" onClick={() => addNewScore(0)} disabled={gameEnded}>- Ohi -</Button></div>
        </Row>
      </Container>
      <ButtonToolbar className="molkkyButtonToolBar">
        <Button style={{ margin: '0.1em' }} size="me" onClick={saveGame} disabled={disable}>Tallenna</Button>
        <Button style={{ margin: '0.1em' }} size="me" onClick={endGame}>Lopeta</Button>
      </ButtonToolbar>
    </Container>
  );
};

export default Molkky;