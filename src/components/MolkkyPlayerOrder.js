import React, { useRef, useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Container, ButtonToolbar, Button } from "react-bootstrap";
import {useNavigate} from 'react-router-dom';
import '../Styles.css';
import { clearGameState } from "./Molkky";

const STORAGE_KEY = 'molkky_active_game_state';



// Sortable item (only name is draggable, index is fixed)
function SortableItem({ id, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-item">
      <span className="sortable-index"  >
        {index + 1}
      </span>
      <span>{id}</span>
    </li>
  );
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DragList() {
    const h2 = useRef();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [disable, setDisable] = useState(true);

    // Load players from localStorage once when component mounts
    useEffect(() => {
        const amount = parseInt(localStorage.getItem("playerAmount") || "0", 10);
        const loadedPlayers = [];
        for (let i = 0; i < amount; i++) {
            const player = localStorage.getItem("player" + i);
            if (player) loadedPlayers.push(player);
        }
        setPlayers(loadedPlayers);
        const savedData = localStorage.getItem(STORAGE_KEY);
        if(savedData) {
          setDisable(false);
        }
    }, []);

    // Save players back to localStorage whenever order changes
    useEffect(() => {
      if (players.length > 0) {
        localStorage.setItem("playerAmount", players.length);
        players.forEach((player, i) => {
        localStorage.setItem("player" + i, player);
        });
      }
    }, [players]);

    // Enable mouse + touch + keyboard sensors
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(TouchSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setPlayers((prevPlayers) => {
        const oldIndex = prevPlayers.indexOf(active.id);
        const newIndex = prevPlayers.indexOf(over.id);
        return arrayMove(prevPlayers, oldIndex, newIndex);
      });
    }
  };

  const shufflePlayers = () => {
    setPlayers((prev) => shuffleArray(prev));
  };

  /**
     * Checks the current mode and makes changes if necessary
     */
    useEffect(() => {
      if(localStorage.getItem("mode") === "dark"){
        document.body.style.backgroundImage = "url('/images/darkmode.jpg')";
        h2.current.style.color = "white";
      }
      else {
        document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
        h2.current.style.color = "black";
      }
    }, []);

  const handleContinueMolkkyGame = () => {
    navigate('/molkky');
  };

  const handleNewMolkkyGame = () => {
    clearGameState();
    localStorage.setItem("teamGame", false);
    localStorage.removeItem("molkky_teams");
    navigate('/molkky');
  };

  const handleBack = () =>{
    navigate("/players")
  }

  return (
    <Container>
      <h2 ref={h2}>Valitse heittojärjestys</h2>
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={players} strategy={verticalListSortingStrategy}>
            <ul className="sortable-list">
              {players.map((item, index) => (
                <SortableItem key={item} id={item} index={index} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
      <ButtonToolbar className='molkkyButtonToolBar'>
        <Button style={{margin: "3.2rem 0.1rem"}} size="me" onClick={shufflePlayers}>Sekoita</Button>
        <Button style={{margin: "3.2rem 0.1rem"}} size="me" onClick={handleContinueMolkkyGame} disabled={disable}>Jatka peliä</Button>
      </ButtonToolbar>
      <ButtonToolbar className='molkkyButtonToolBar'>      
          <Button style={{margin: "0.1rem"}} size="me" onClick={handleBack}>Takaisin</Button>
          <Button style={{margin: "0.1rem"}} size="me" onClick={handleNewMolkkyGame}>Uusi peli</Button>
      </ButtonToolbar>
    </Container>
  );
}
