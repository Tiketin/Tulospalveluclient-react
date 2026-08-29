import React, { useRef, useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Container, ButtonToolbar, Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../Styles.css";
import { clearGameState } from "./Molkky";
import Team from "../utils/Team";

const STORAGE_KEY = "molkky_active_game_state";
const TEAMS_STORAGE_KEY = "molkky_teams";

function ItemCard({ id, index, style, ref, attributes, listeners, isDragging }) {
  return (
    <li
      ref={ref}
      style={{
        ...style,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
      className="sortable-item"
    >
      <span className="sortable-index">{index + 1}</span>
      <span>{id}</span>
    </li>
  );
}

function SortableItem({ id, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <ItemCard
      id={id}
      index={index}
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
    />
  );
}

function DroppableTeamContainer({ containerId, title, items }) {
  const { setNodeRef } = useDroppable({ id: containerId });

  return (
    <div className="team-container" style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{title}</h3>
      <div ref={setNodeRef} style={{ minHeight: "60px" }}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="sortable-list">
            {items.map((item, index) => (
              <SortableItem key={item} id={item} index={index} />
            ))}
          </ul>
        </SortableContext>
      </div>
    </div>
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
  const [disable, setDisable] = useState(true);

  const [teamCount, setTeamCount] = useState(2);
  const [inputValue, setInputValue] = useState("2");
  const [teams, setTeams] = useState([]); // Stores instances of Team class
  const [activeId, setActiveId] = useState(null);

  // Load players and restore saved Team instances on mount
  useEffect(() => {
   
    const amount = parseInt(localStorage.getItem("playerAmount") || "0", 10);
    const loadedPlayers = [];
    for (let i = 0; i < amount; i++) {
        const player = localStorage.getItem("player" + i);
        if (player) loadedPlayers.push(player);
    }
    distributePlayers(loadedPlayers, teamCount);
    

    if (localStorage.getItem(STORAGE_KEY)) {
      setDisable(false);
    }
  }, []);

  const distributePlayers = (playerList, numTeams) => {
    const rawTeams = Array.from({ length: numTeams }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Joukkue ${i + 1}`,
      members: [],
    }));

    playerList.forEach((player, index) => {
      const teamIdx = index % numTeams;
      rawTeams[teamIdx].members.push(player);
    });

    const teamInstances = rawTeams.map((t) => new Team(t));
    setTeams(teamInstances);
  };

  const applyTeamCount = (count) => {
    const totalPlayers = teams.flatMap((t) => t.members).length || 1;
    const validCount = Math.max(1, Math.min(totalPlayers, count));
    setTeamCount(validCount);
    setInputValue(String(validCount));

    const allPlayers = teams.flatMap((t) => t.members);
    distributePlayers(allPlayers, validCount);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      const totalPlayers = teams.flatMap((t) => t.members).length || 1;
      const bounded = Math.min(totalPlayers, parsed);
      setTeamCount(bounded);
      const allPlayers = teams.flatMap((t) => t.members);
      distributePlayers(allPlayers, bounded);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      applyTeamCount(1);
    } else {
      applyTeamCount(parsed);
    }
  };

  // Persist Team instances to localStorage conforming to the Team structure
  useEffect(() => {
    if (teams.length > 0) {
      const allPlayers = teams.flatMap((t) => t.members);
      localStorage.setItem("playerAmount", allPlayers.length);
      allPlayers.forEach((player, i) => {
        localStorage.setItem("player" + i, player);
      });

      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    }
  }, [teams]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id) => {
    if (teams.some((t) => t.id === id)) return id;
    return teams.find((t) => t.members.includes(id))?.id;
  };

  const customCollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTeams((prevTeams) => {
      const movedItem = active.id;
      return prevTeams.map((team) => {
        if (team.id === activeContainer) {
          return new Team({
            ...team,
            members: team.members.filter((item) => item !== movedItem),
          });
        }
        if (team.id === overContainer) {
          const overIndex = team.members.indexOf(over.id);
          const newMembers = [...team.members];
          if (overIndex >= 0) {
            newMembers.splice(overIndex, 0, movedItem);
          } else {
            newMembers.push(movedItem);
          }
          return new Team({ ...team, members: newMembers });
        }
        return team;
      });
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (activeContainer && overContainer && activeContainer === overContainer) {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === activeContainer) {
            const oldIndex = team.members.indexOf(active.id);
            const newIndex = team.members.indexOf(over.id);
            if (oldIndex !== newIndex) {
              return new Team({
                ...team,
                members: arrayMove(team.members, oldIndex, newIndex),
              });
            }
          }
          return team;
        })
      );
    }
  };

  const shufflePlayers = () => {
    const allPlayers = teams.flatMap((t) => t.members);
    const shuffled = shuffleArray(allPlayers);
    distributePlayers(shuffled, teams.length);
  };

  useEffect(() => {
    if (localStorage.getItem("mode") === "dark") {
      document.body.style.backgroundImage = "url('/images/darkmode.jpg')";
      if (h2.current) h2.current.style.color = "white";
    } else {
      document.body.style.backgroundImage = "url('/images/taustakuva.jpg')";
      if (h2.current) h2.current.style.color = "black";
    }
  }, []);

  const handleContinueMolkkyGame = () => navigate("/molkky");
  const handleNewMolkkyGame = () => {
    clearGameState();
    localStorage.setItem("teamGame", true);
    navigate("/molkky");
  };
  const handleBack = () => navigate("/players");

  const getActiveItemDetails = () => {
    if (!activeId) return { index: 0 };
    for (const team of teams) {
      const index = team.members.indexOf(activeId);
      if (index !== -1) return { index };
    }
    return { index: 0 };
  };

  return (
    <Container>
      <h2 ref={h2}>Valitse joukkueet</h2>

      {/* Mobile-Friendly Team Stepper Control */}
      <Form.Group className="mb-3">
        <Form.Label style={{ display: "block" }}>Joukkueita:</Form.Label>
        <InputGroup style={{ maxWidth: "160px" }}>
          <Button
            variant="outline-secondary"
            onClick={() => applyTeamCount(teamCount - 1)}
            disabled={teamCount <= 1}
            className="teamAmountButton"
          >
            -
          </Button>
          <Form.Control
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={(e) => e.target.select()} // Auto-select all text on tap
            style={{ textAlign: "center" }}
          />
          <Button
            variant="outline-secondary"
            onClick={() => applyTeamCount(teamCount + 1)}
            disabled={teamCount >= teams.flatMap((t) => t.members).length}
            className="teamAmountButton"
          >
            +
          </Button>
        </InputGroup>
      </Form.Group>

      <div className="teamContainerDiv">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {teams.map((team) => (
            <DroppableTeamContainer
              key={team.id}
              containerId={team.id}
              title={team.name}
              items={team.members}
            />
          ))}

          <DragOverlay>
            {activeId ? (
              <ItemCard
                id={activeId}
                index={getActiveItemDetails().index}
                style={{ cursor: "grabbing" }}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <ButtonToolbar className="molkkyButtonToolBar">
        <Button
          style={{ margin: "3.2rem 0.1rem" }}
          size="me"
          onClick={shufflePlayers}
        >
          Sekoita
        </Button>
        <Button
          style={{ margin: "3.2rem 0.1rem" }}
          size="me"
          onClick={handleContinueMolkkyGame}
          disabled={disable}
        >
          Jatka peliä
        </Button>
      </ButtonToolbar>
      <ButtonToolbar className="molkkyButtonToolBar">
        <Button style={{ margin: "0.1rem" }} size="me" onClick={handleBack}>
          Takaisin
        </Button>
        <Button
          style={{ margin: "0.1rem" }}
          size="me"
          onClick={handleNewMolkkyGame}
        >
          Uusi peli
        </Button>
      </ButtonToolbar>
    </Container>
  );
}