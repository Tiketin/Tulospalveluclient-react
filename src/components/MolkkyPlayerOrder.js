import React, { useState, useEffect } from "react";
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
import { Container } from "react-bootstrap";
import {Button} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

// Sortable item component
function SortableItem({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    margin: "8px 0",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    cursor: "grab",
    touchAction: "none", // Needed for mobile drag
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </li>
  );
}

export default function DragList() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);

    // Load players from localStorage once when component mounts
    useEffect(() => {
        const amount = parseInt(localStorage.getItem("playerAmount") || "0", 10);
        const loadedPlayers = [];
        for (let i = 0; i < amount; i++) {
            const player = localStorage.getItem("player" + i);
            if (player) loadedPlayers.push(player);
        }
        setPlayers(loadedPlayers);
    }, []);

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

  const handleBack = () =>{
    navigate("/players")
  }

  return (
    <Container>
      <h2>Valitse pelijärjestys</h2>
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={players} strategy={verticalListSortingStrategy}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {players.map((item) => (
                <SortableItem key={item} id={item} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
      <Button size="lg" onClick={handleBack}>Takaisin</Button>
    </Container>
  );
}
