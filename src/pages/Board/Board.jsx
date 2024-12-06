import "../../App.css";
import "./Board.css";

import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/navbar/Navbar";
import AddList from "../../components/addList/AddList";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import List from "../../components/List/List";
import SideBar from "../../components/sideBar/SideBar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Spinner from "react-bootstrap/esm/Spinner";
import api from "../../apiAuth/auth";

import BoardHeader from "../../components/header/Header";

import bgBoardImg from '../../assets/pexels-fauxels-3184160.jpg';
import { ImageContext } from "../../components/context/BgImgContext";
import Notifications from "../../components/push notifications/PushNotifications";
import { AuthContext } from "../../components/context/Auth";

function Board() {
  const [show, setShow] = useState(false);

  const [postion, setpostion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [board, setboard] = useState({});

  const { selectedImage } = useContext(ImageContext) || {}; // Safely handle undefined
  console.log("selectedImage", selectedImage);

  const { boardId, workspaceId } = useParams();

  const cookies = Cookies.get("token");
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  const pathName = path.split("/")[1];



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

    if (boardId) {
      getBoard();
      
    }
  }, [boardId]);

  useEffect(() => {
    if (!show) {
      document.querySelector(".views")?.classList.add("large");
    } else {
      document.querySelector(".views")?.classList.remove("large");
    }
  }, [show]);

  const handleDragAndDrop = async (result) => {
    const { source, destination, type } = result;

    // If there is no destination (invalid drop area)
    if (!destination) return;

    // If the source and destination are the same (no need to update)
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === "list") {
      // Reordering the lists
      const updatedLists = [...board.lists_of_the_board];
      const [movedList] = updatedLists.splice(source.index, 1);
      updatedLists.splice(destination.index, 0, movedList);

      // Ensure that movedList.id and updated lists are part of the current board
      setboard((prev) => ({ ...prev, lists_of_the_board: updatedLists })); // تعديل: استخدمت نسخة "prev" للذاكرة لتجنب مشاكل السباق (race condition)

      console.log("moved list", movedList);
      console.log("destination", destination);

      // إرسال التحديث إلى السيرفر في الخلفية لتقليل التأخير
      try {
        await api({
          url: `/move-list/${movedList.id}`,
          method: "POST",
          headers: { Authorization: `Bearer ${cookies}` },
          data: {
            board_id: parseInt(boardId),
            lists: updatedLists.map((list) => list.id),
            position: destination.index,
          },
        });
        console.log("succeed");
      } catch (err) {
        console.log(
          "Error updating list order:",
          err.response?.data || err.message
        );

        console.log("Payload:", {
          board_id: parseInt(boardId),
          lists: updatedLists.map((list) => list.id),
          position: destination.index,
        });
      }
    } else if (type === "card") {
      const sourceList = board.lists_of_the_board.find(
        (list) => list.id.toString() === source.droppableId
      );
      const destinationList = board.lists_of_the_board.find(
        (list) => list.id.toString() === destination.droppableId
      );

      const sourceCards = [...sourceList.cards_of_the_list]; // تعديل: تحسين تسميات المتغيرات للوضوح
      const destinationCards =
        sourceList.id === destinationList.id
          ? sourceCards
          : [...destinationList.cards_of_the_list];

      const [movedCard] = sourceCards.splice(source.index, 1);
      destinationCards.splice(destination.index, 0, movedCard);

      // Logging العملية
      console.log("Dragged card:", result);

      console.log(
        `Moved card from list ${sourceList.id} (index ${source.index})`
      );
      console.log(`Card details: ${JSON.stringify(movedCard)} `);
      console.log(
        `Destination list: ${destinationList.id} (index ${destination.index})`
      );

      if (sourceList.id === destinationList.id) {
        // تحديث اللستة نفسها إذا كانت الكارد في نفس اللستة
        setboard((prev) => ({
          ...prev,
          lists_of_the_board: prev.lists_of_the_board.map((list) => {
            if (list.id === sourceList.id) {
              return { ...list, cards_of_the_list: sourceCards };
            }
            return list;
          }),
        }));
      } else {
        // تحديث لستتين مختلفتين
        const updatedLists = board.lists_of_the_board.map((list) => {
          if (list.id === sourceList.id) {
            return { ...list, cards_of_the_list: sourceCards };
          }
          if (list.id === destinationList.id) {
            return { ...list, cards_of_the_list: destinationCards };
          }
          return list;
        });

        setboard((prev) => ({ ...prev, lists_of_the_board: updatedLists })); // تعديل: استخدام نسخة "prev" لضمان تجنب مشاكل السباق
      }
      console.log("moved card", movedCard);
      // إرسال التحديثات إلى السيرفر في الخلفية
      try {
        await api({
          url: `cards/move-card/${movedCard.id}`,
          method: "POST",
          headers: { Authorization: `Bearer ${cookies}` },
          data: {
            id: parseInt(movedCard.id),
            the_board_name: board.name,
            the_list_name: destinationList.name,
            position: destination.index,
            text: movedCard.text,
            completed: movedCard.completed,
            the_list_id: destinationList.id,
          },
        });

        console.log(
          `Destination list: ${destinationList.id} (index ${destination.index})`
        );
      } catch (err) {
        console.log(
          "Error updating card order:",
          err.response?.data || err.message
        );
      }
    }
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

  console.log(board);
  return (
    <div
      className="boards"
      style={{
        backgroundImage: selectedImage
          ? `url(${selectedImage})`
          : `url(${bgBoardImg})`,

        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
      }}
    >
      <Navbar
        setShow={setShow}
        boardBg={selectedImage}
        board=  {board}
      />
      <Notifications userid={user.id} workspaceId={workspaceId} />

      <SideBar show={show} setShow={setShow} />
      <BoardHeader boardName={board.name} showSideBar={show} />
      <div
        className="wrapper views"
        style={{
          transform: show ? "translateX(250px)" : "translateX(0)",
        }}
      >
        <DragDropContext
          onDragEnd={handleDragAndDrop}
          disableInteractiveElements
        >
          <Droppable droppableId="ROOT" type="list" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="wrapper-lists"
              >
                {board &&
                  board?.lists_of_the_board?.length > 0 &&
                  board.lists_of_the_board.map((list, index) => (
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
                          className="draggable"
                        >
                          <List
                            list={list}
                            boardId={Number(boardId)}
                            setboard={setboard}
                            board={board}
                            setShow={setShow}
                          />

                          {provided.placeholder}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
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
