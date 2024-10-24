import "../../App.css";
import "./Board.css";

import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/navbar/Navbar";
import AddList from "../../components/addList/AddList";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import List from "../../components/List/List";
import SideBar from "../../components/sideBar/SideBar";
import { useParams } from "react-router-dom";
import Spinner from "react-bootstrap/esm/Spinner";
import api from "../../apiAuth/auth";

function Board() {
  const [show, setShow] = useState(true);

  const [postion, setpostion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [board, setboard] = useState({});
  const { boardId } = useParams();

  const cookies = Cookies.get("token");

  useEffect(() => {
    const getBoard = async () => {
      try {
        const { data } = await api({
          url: `boards/get-board/${boardId}`,
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setboard(data.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getBoard();
  }, [boardId]);

  useEffect(() => {
    if (!show) {
      document.querySelector(".views")?.classList.add("large");
    } else {
      document.querySelector(".views")?.classList.remove("large");
    }
  }, [show]);

  const handleDragAndDrop = (results) => {
    console.log(results);
  };

  if (loading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center position-fixed top-0 left-0">
        <Spinner animation="border" role="status" variant="primary" size="md">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div
      className="boards"
      style={{
        backgroundImage: board.photo
          ? `url(https://back.alyoumsa.com/public/storage/${board.photo})`
          : "url(/photo-1675981004510-4ec798f42006.jpg)",
        backgroundSize: "cover",
      }}
    >
      <Navbar setShow={setShow} />
      <SideBar show={show} setShow={setShow} />
      <div className="wrapper views">
        <DragDropContext onDragEnd={handleDragAndDrop}>
          <div className="board-options">
            <span>{board.name}</span>
          </div>
          <Droppable droppableId="ROOT" type="group" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="wrapper-lists"
              >
                {board.lists_of_the_board.map((list, index) => (
                  <Draggable
                    draggableId={list.id.toString()}
                    index={index}
                    key={list.id}
                  >
                    {(provided) => (
                      <div
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                      >
                        <List
                          list={list}
                          boardId={Number(boardId)}
                          setboard={setboard}
                          board={board}
                          setShow={setShow}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}

                <AddList
                  setShow={setShow}
                  boardId={board.id}
                  setboard={setboard}
                />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Board;
