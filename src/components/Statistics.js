import {Form, FormText, Table, Button, Modal} from 'react-bootstrap';
import '../Styles.css';
import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Row from 'react-bootstrap/Row';

const apiUrl = process.env.REACT_APP_API_URL;

const Statistics = () => {
  const navigate = useNavigate();
  const handleMenu = () => {
    navigate('/menu')
  }


  const [playerTable, setPlayerTable] = useState();
  const [AdvancedPlayerTable, setAdvancedPlayerTable] = useState();
  const hasFetched = useRef(false);
  const h2 = useRef();

  let json;
  let tuloksetJSON;
  let players = [];
  let player;
  let advancedPlayers = [];
  let advancedPlayer;
  /**
   * Tarkistaa, löytyykö ryhmästä pelaajia.
   */
  const getPlayers = () => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        json = JSON.parse(xmlhttp.responseText);
        if (json.numOfRows > 0) { // something found
          console.log('Pelaajia löytyi /Statistics');
          console.log(json);

          for (let i in json.rows) {
            player = {nimi: json.rows[i].nimi, pelatutlkm: json.rows[i].pelatutlkm, voitotlkm: json.rows[i].voitotlkm};
            players.push(player);
          }
          if(players.length > 0){
            getPlayerStats();
          }
          setPlayerTable(players.map((row, i) =>
              <tr >
                <td>{row.nimi}</td>
                <td>{row.pelatutlkm}</td>
                <td>{row.voitotlkm}</td>
              </tr>
          ));
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

  /**
   * Etsii tietyn pelaajan statistiikat.
   * @param id
   */

  const getPlayerStats = () => {
    for(let i = 0; i < players.length; i++) {
      let xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          json = JSON.parse(xmlhttp.responseText);
          if (json.numOfRows > 0) { // something found
            tuloksetJSON = JSON.parse(xmlhttp.responseText);
            console.log(tuloksetJSON);
            for (let i in tuloksetJSON.rows) {

              let heitotlkm = (tuloksetJSON.rows[i].p0 +
                  tuloksetJSON.rows[i].p1 + tuloksetJSON.rows[i].p2 +
                  tuloksetJSON.rows[i].p3 + tuloksetJSON.rows[i].p4 +
                  tuloksetJSON.rows[i].p5 +
                  tuloksetJSON.rows[i].p6 + tuloksetJSON.rows[i].p7 +
                  tuloksetJSON.rows[i].p8 + tuloksetJSON.rows[i].p9 +
                  tuloksetJSON.rows[i].p10 + tuloksetJSON.rows[i].p11 +
                  tuloksetJSON.rows[i].p12);

              let voittoprosentti = (tuloksetJSON.rows[i].voitotlkm /
                  tuloksetJSON.rows[i].pelatutlkm) * 100;
              let osumatarkkuus = ((tuloksetJSON.rows[i].p1 +
                      tuloksetJSON.rows[i].p2 + tuloksetJSON.rows[i].p3 +
                      tuloksetJSON.rows[i].p4 + tuloksetJSON.rows[i].p5 +
                      tuloksetJSON.rows[i].p6 + tuloksetJSON.rows[i].p7 +
                      tuloksetJSON.rows[i].p8 + tuloksetJSON.rows[i].p9 +
                      tuloksetJSON.rows[i].p10 + tuloksetJSON.rows[i].p11 +
                      tuloksetJSON.rows[i].p12) /
                  (tuloksetJSON.rows[i].p0 + tuloksetJSON.rows[i].p1 +
                      tuloksetJSON.rows[i].p2 + tuloksetJSON.rows[i].p3 +
                      tuloksetJSON.rows[i].p4 + tuloksetJSON.rows[i].p5 +
                      tuloksetJSON.rows[i].p6 + tuloksetJSON.rows[i].p7 +
                      tuloksetJSON.rows[i].p8 + tuloksetJSON.rows[i].p9 +
                      tuloksetJSON.rows[i].p10 + tuloksetJSON.rows[i].p11 +
                      tuloksetJSON.rows[i].p12)) * 100;

              let pistekeskiarvo = (tuloksetJSON.rows[i].p0 +
                  tuloksetJSON.rows[i].p1 + tuloksetJSON.rows[i].p2 * 2 +
                  tuloksetJSON.rows[i].p3 * 3 + tuloksetJSON.rows[i].p4 * 4 +
                  tuloksetJSON.rows[i].p5 * 5 +
                  tuloksetJSON.rows[i].p6 * 6 + tuloksetJSON.rows[i].p7 * 7 +
                  tuloksetJSON.rows[i].p8 * 8 + tuloksetJSON.rows[i].p9 * 9 +
                  tuloksetJSON.rows[i].p10 * 10 + tuloksetJSON.rows[i].p11 *
                  11 +
                  tuloksetJSON.rows[i].p12 * 12) / heitotlkm;

              if (tuloksetJSON.rows[0].pelatutlkm === 0) {
                voittoprosentti = 0;
                osumatarkkuus = 0;
                pistekeskiarvo = 0;
              }

              advancedPlayer = {
                nimi: tuloksetJSON.rows[i].nimi,
                pelatutlkm: tuloksetJSON.rows[i].pelatutlkm,
                voitotlkm: tuloksetJSON.rows[i].voitotlkm,
                voittoprosentti: voittoprosentti.toFixed(1) + '%',
                heitotlkm: heitotlkm,
                osumatarkkuus: osumatarkkuus.toFixed(1) + '%',
                pistekeskiarvo: pistekeskiarvo.toFixed(1) + 'p'
              };
              advancedPlayers.push(advancedPlayer); //ehkä tarvitaan, ehkä ei :O

            }
            console.log(advancedPlayers);
            setAdvancedPlayerTable(advancedPlayers.map((row, i) =>
                <tr>
                  <td data-label="Nimi">{row.nimi}</td>
                  <td data-label="Ottelut">{row.pelatutlkm}</td>
                  <td data-label="Voitot">{row.voitotlkm}</td>
                  <td data-label="Voittoprosentti">{row.voittoprosentti}</td>
                  <td data-label="Heitot">{row.heitotlkm}</td>
                  <td data-label="Osumatarkkuus">{row.osumatarkkuus}</td>
                  <td data-label="Pistekeskiarvo">{row.pistekeskiarvo}</td>
                </tr>
            ));

          } else {
            alert('Pelaajan statistiikkoja ei löydy!');
          }
        }
      };
      xmlhttp.open("GET",
          apiUrl + "/api/player?group=" +
          localStorage.getItem("group") + "&player=" + json.rows[i].nimi, true);
      xmlhttp.send();
    }
  };

  useEffect(() => {
    if(localStorage.getItem("mode") === "dark"){
      document.body.style.backgroundImage = "url('/images/darkmode.jpg')";
      h2.current.style.color = "white";
    }
    else {
      document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
      h2.current.style.color = "black";
    }
    if (!hasFetched.current) {
    getPlayers();
    getPlayerStats();
    hasFetched.current = true;
    }
  }, []);


  return(
      <div>
        <div>
          <h2 ref={h2}>Ryhmän Statistiikka</h2>
        </div>
        <div className="scrollContainer">
          <Table striped id="statsTable">
            <thead>
            <tr>
              <th>Nimi:</th>
              <th>Ottelut:</th>
              <th>Voitot:</th>
              <th>Voittoprosentti:</th>
              <th>Heitot:</th>
              <th>Osumatarkkuus:</th>
              <th>Pistekeskiarvo:</th>
            </tr>
            </thead>
            <tbody>
            {AdvancedPlayerTable}
            </tbody>
          </Table>
        </div>
        <div className="backToMenu">
          <Button onClick={handleMenu} size="lg">Takaisin</Button>
        </div>
      </div>
  );

};
export default Statistics;