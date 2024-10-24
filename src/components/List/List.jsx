import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";

import { useRef, useState } from "react";
import Card from "../card/Card";

import Cookies from "js-cookie";
import api from "../../apiAuth/auth";

import Dropdown from "react-bootstrap/Dropdown";
import "./list.css";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

function List({ list, setboard, boardId, board, setShow }) {
  const [showCardList, setshowCardList] = useState(false);
  const [error, seterror] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedListName, setEditedListName] = useState(list.title);

  const cardTitle = useRef(null);

  const cookies = Cookies.get("token");

  const addCard = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/cards/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          text: cardTitle.current.value,
          the_list_id: list.id,
          // photo: "",
        },
      });
      setboard((prev) => ({
        ...prev,
        lists_of_the_board: prev.lists_of_the_board.map((item) => {
          if (item.id == list.id) {
            return {
              ...item,
              cards_of_the_list: [
                ...item.cards_of_the_list,
                {
                  id: data.data.id,
                  text: data.data.text,
                },
              ],
            };
          } else {
            return item;
          }
        }),
      }));
      cardTitle.current.value = "";
    } catch (err) {
      console.log(err);
      seterror(err.response?.data?.message);
    }
  };

  const handleCardDelete = async (cardId) => {
    try {
      await api({
        url: `/cards/destroy/${cardId}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${cookies}` },
      });

      setboard((prev) => ({
        ...prev,
        lists_of_the_board: prev.lists_of_the_board.map((item) => {
          if (item.id === list.id) {
            return {
              ...item,
              cards_of_the_list: item.cards_of_the_list.filter(
                (card) => card.id !== cardId
              ),
            };
          }
          return item;
        }),
      }));
    } catch (err) {
      console.log(err);
      seterror(err.response?.data?.message);
    }
  };

  // Function to delete a list
  const handleDeleteList = async () => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        await api({
          url: `/lists/destroy/${list.id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setboard((prev) => ({
          ...prev,
          lists_of_the_board: prev.lists_of_the_board.filter(
            (item) => item.id !== list.id
          ),
        }));
      } catch (err) {
        console.log(err);
        seterror(err.response?.data?.message);
      }
    }
  };

  // Function to handle list title editing

  const handleEditListClick = () => {
    setEditedListName(list.title);
    setShowEditModal(true);
  };

  const handleSaveListClick = async () => {
    if (!editedListName.trim()) {
      seterror("List name cannot be empty");
      return;
    }

    try {
      const response = await api({
        url: "/lists/update",
        method: "POST",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          list_id: list.id,
          board_id: boardId,
          title: editedListName,
        },
      });

      if (response.data.success) {
        setboard((prev) => ({
          ...prev,
          lists_of_the_board: prev.lists_of_the_board.map((item) =>
            item.id === list.id ? { ...item, title: editedListName } : item
          ),
        }));
        setShowEditModal(false);
      } else {
        seterror("Failed to update the list. Please try again.");
      }
    } catch (err) {
      console.log("Error response:", err);
      seterror(
        err.response?.data?.message ||
          "An error occurred while updating the list."
      );
    }
  };

  return (
    <div className="list">
      <div className="list-header d-flex align-items-center justify-content-between my-2">
        <h3>{list.title}</h3>
        <Dropdown>
          <Dropdown.Toggle
            as="button"
            className="custom-dropdown-toggle p-0 no-caret"
          >
            <span className="vertical-dots">⋮</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="bg-white border-0 shadow">
            <Dropdown.Item onClick={handleEditListClick}>
              <i className="fa-regular fa-pen-to-square me-2"></i> Edit
            </Dropdown.Item>
            <Dropdown.Item className="text-danger" onClick={handleDeleteList}>
              <i className="fa-regular fa-trash-can me-2"></i> Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Droppable droppableId={list.id.toString()}>
        {(provided) => (
          <div
            className="wrapper"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {list.cards_of_the_list.map((card, i) => (
              <Draggable
                draggableId={card.id.toString()}
                index={i}
                key={card.id}
              >
                {(provided) => (
                  <div
                    className="item-container"
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    style={{ width: "98%", margin: "6px 0" }}
                  >
                    <Card
                      index={i}
                      card={card}
                      listId={list.id}
                      onCardDelete={handleCardDelete}
                      board={board}
                      setShow={setShow}
                    />
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
      <Dropdown className="addList addListCard">
        <Dropdown.Toggle className="addList addListCard" id="dropdown-basic">
          <img src="/plus.svg" alt="" />
          <button
            type="text"
            onClick={() => {
              setshowCardList(true);
              setShow(false);
            }}
          >
            Add a card
          </button>
        </Dropdown.Toggle>

        <Dropdown.Menu className="addListForm addListCard">
          <form onSubmit={addCard}>
            <input
              ref={cardTitle}
              type="text"
              placeholder="Enter card title…"
              required
              autoFocus
            />
            <div>
              <Button
                type="submit"
                variant="primary"
                onClick={() => seterror(null)}
              >
                Add card
              </Button>
            </div>
          </form>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit List Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formListName">
            <Form.Label>List Name</Form.Label>
            <Form.Control
              type="text"
              value={editedListName}
              onChange={(e) => setEditedListName(e.target.value)}
              placeholder="Enter new list name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveListClick}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default List;
