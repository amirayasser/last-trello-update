import "./Workspaces.css";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/navbar/Navbar";
import { Link, NavLink } from "react-router-dom";
import SideBar from "../../components/sideBar/SideBar";
import Cookies from "js-cookie";
import Spinner from "react-bootstrap/Spinner";
import api from "../../apiAuth/auth";
import { Modal, Button, Form } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Dropdown } from "react-bootstrap";
import PopupMsg from "../../components/popupmsg/PopupMsg";

import bgimg from '../../assets/pexels-anastasia-shuraeva-7278606.jpg'
import Notifications from "../../components/push notifications/PushNotifications";

function Workspace() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workSpaces, setworkSpaces] = useState([]);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardName, setEditedBoardName] = useState("");
  const [editedBoardPhoto, setEditedBoardPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editedWorkspaceName, setEditedWorkspaceName] = useState("");
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const [wsMembers, setWsMembers] = useState({}); // تخزين الأعضاء بناءً على Workspace ID
  const [loadingWorkspaceId, setLoadingWorkspaceId] = useState(null); // ID الخاص بالـ Workspace الجاري تحميله

  const [openPopUp , setOpenPopUp] = useState(false); 
  const [allUsers, setAllUsers] = useState([]);



  const cookies = Cookies.get("token");

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api({
        url: "/workspaces/get-workspaces",
        headers: { Authorization: `Bearer ${cookies}` },
      });
      setworkSpaces(data.result);
      console.log('workspaces : ' + data.result);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [cookies]);

  const handleEditClick = (board_id, currentBoardName, currentBoardPhoto) => {
    setEditingBoardId(board_id);
    setEditedBoardName(currentBoardName);
    setEditedBoardPhoto(currentBoardPhoto);
    setShowModal(true);
  };

  const handleSaveClick = async (workspace_id, board_id) => {
    try {
      // تحديث اسم اللوحة
      const nameUpdateResponse = await api({
        url: `/boards/update/${board_id}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "application/json",
        },
        data: {
          workspace_id: workspace_id,
          name: editedBoardName,
        },
      });

      if (nameUpdateResponse.data.success) {
        console.log(
          "Board name updated successfully:",
          nameUpdateResponse.data.data
        );

        let updatedPhotoUrl = null;

        // تحديث الصورة إذا كانت موجودة
        if (editedBoardPhoto && editedBoardPhoto instanceof File) {
          const photoFormData = new FormData();
          photoFormData.append("photo", editedBoardPhoto);

          const photoUploadResponse = await api({
            url: `/boards/upload/${board_id}`,
            method: "POST",
            headers: {
              Authorization: `Bearer ${cookies}`,
              "Content-Type": "multipart/form-data",
            },
            data: photoFormData,
          });

          if (photoUploadResponse.data.success) {
            updatedPhotoUrl = photoUploadResponse.data.data.photo;
            console.log("Board photo uploaded successfully:", updatedPhotoUrl);
          } else {
            console.log(
              "Photo upload failed:",
              photoUploadResponse.data.message
            );
          }
        }

        // تحديث الـ workspaces في الحالة
        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.map((workspace) =>
            workspace.id === workspace_id
              ? {
                  ...workspace,
                  boards_of_the_workspace:
                    workspace.boards_of_the_workspace.map((board) =>
                      board.id === board_id
                        ? {
                            ...board,
                            name: editedBoardName,
                            photo: updatedPhotoUrl,
                          }
                        : board
                    ),
                }
              : workspace
          )
        );

        // إعادة تعيين الحقول
        setEditingBoardId(null);
        setEditedBoardName("");
        setEditedBoardPhoto(null); // تأكد من إعادة تعيين الصورة إذا كانت فارغة
        setShowModal(false);
      } else {
        console.log(
          "Board name update failed:",
          nameUpdateResponse.data.message
        );
      }
    } catch (error) {
      console.error("Error updating board:", error);
      alert("Failed to update board. Please try again.");
    }
  };


  
  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditedBoardName("");
    setEditedBoardPhoto(null);
    setShowModal(false);
  };

  const handleDeleteClick = async (workspace_id, board_id) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await api({
          url: `/boards/destroy/${board_id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.map((workspace) =>
            workspace.id === workspace_id
              ? {
                  ...workspace,
                  boards_of_the_workspace:
                    workspace.boards_of_the_workspace.filter(
                      (board) => board.id !== board_id
                    ),
                }
              : workspace
          )
        );
      } catch (error) {
        console.log("Error deleting board:", error);
      }
    }
  };

  // edit and delete workspace

  const handleSaveWorkspaceClick = async () => {
    try {
      const response = await api({
        url: `/workspaces/update`,
        method: "POST",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { workspace_id: editingWorkspaceId, name: editedWorkspaceName },
      });

      setworkSpaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.id === editingWorkspaceId
            ? { ...workspace, name: editedWorkspaceName }
            : workspace
        )
      );

      setEditingWorkspaceId(null);
      setEditedWorkspaceName("");
      setShowWorkspaceModal(false);
    } catch (error) {
      console.log("Error updating workspace name:", error);
    }
  };

  const handleEditWorkspaceClick = (workspace_id, currentWorkspaceName) => {
    setEditingWorkspaceId(workspace_id);
    setEditedWorkspaceName(currentWorkspaceName);
    setShowWorkspaceModal(true);
  };

  const handleDeleteWorkspaceClick = async (workspace_id) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      try {
        await api({
          url: `/workspaces/destroy/${workspace_id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.filter((workspace) => workspace.id !== workspace_id)
        );
      } catch (error) {
        console.log("Error deleting workspace:", error);
      }
    }
  };

  const getWorkspaceMembers = async (workspaceId) => {
    // إذا كانت البيانات موجودة بالفعل، لا تقم بجلبها مجددًا
    if (wsMembers[workspaceId])
      return console.log("ws members already exist", wsMembers[workspaceId]);

    setLoadingWorkspaceId(workspaceId); // تعيين ID الجاري تحميله
    try {
      const response = await api({
        url: `/workspaces/${workspaceId}/users`,
        method: "GET",
        headers: { Authorization: `Bearer ${cookies}` },
      });

      const members = Array.isArray(response.data.result)
        ? response.data.result
        : [];

      // تحديث الأعضاء مع ربطهم بـ workspaceId
      setWsMembers((prev) => ({
        ...prev,
        [workspaceId]: members,
      }));
      console.log("Workspace members for ID", workspaceId, members);
      // }, 100);
      // تحديث الأعضاء مع ربطهم بـ workspaceId
    } catch (error) {
      console.error("Error getting workspace members:", error);
      // حفظ ID مع بيانات فارغة في حال الخطأ
      setWsMembers((prev) => ({
        ...prev,
        [workspaceId]: [],
      }));
    } finally {
      setLoadingWorkspaceId(null); // إنهاء التحميل
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (!show) {
      document.querySelector(".views")?.classList.add("large");
    } else {
      document.querySelector(".views")?.classList.remove("large");
    }
  }, [show]);

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
    <div className="home">
      <Navbar
        workSpaces={workSpaces}
        setShow={setShow}
        setworkSpaces={setworkSpaces}
        allUsers={allUsers}
        setAllUsers={setAllUsers}
      />

      <SideBar show={show} setShow={setShow} />
      <div
        className="views"
        style={{
          minHeight: "100vh",
          width: show ? "calc(100% - 280px)" : "100%",
          marginLeft: show ? "280px" : "0",
        }}
      >
        <h3>YOUR WORKSPACES</h3>
        <div className="workSpacesContainer">
          {workSpaces.map((workspace) => (
            <div className="workspace-item" key={workspace.id}>
              {" "}
              {/* single workspace */}
              <div className="d-flex justify-content-between mb-5">
                <div>
                  <h3>{workspace.name}</h3>
                </div>
                <div className="workspace-bar">
                  <NavLink
                    to={`/workspace/${workspace.id}`}
                    className="ws-option"
                  >
                    Boards
                  </NavLink>

                  <Dropdown
                    key={workspace.id}
                    onClick={() => {
                      getWorkspaceMembers(workspace.id);
                      console.log(workspace.id);
                    }}
                  >
                    <Dropdown.Toggle
                      id={`dropdown-${workspace.id}`}
                      className="ws-option"
                    >
                      Members
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="membersMenu">
                      {loadingWorkspaceId === workspace.id ? (
                        <Dropdown.Item>Loading members...</Dropdown.Item> // إذا كانت البيانات لا تزال قيد التحميل
                      ) : wsMembers[workspace.id] &&
                        wsMembers[workspace.id]?.length > 0 ? (
                        // إذا كان هناك أعضاء
                        wsMembers[workspace.id].map((member) => (
                          <Dropdown.Item
                            key={member.user_id}
                            className="custom-dropdown-item"
                          >
                            {member.user_name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        // إذا لم يكن هناك أعضاء
                        <Dropdown.Item>No members found</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>

                  <button
                    className="ws-option"
                    onClick={() =>
                      handleEditWorkspaceClick(workspace.id, workspace.name)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="ws-option"
                    onClick={() => handleDeleteWorkspaceClick(workspace.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="wrapper views-wrapper">
                {workspace.boards_of_the_workspace.map((board) => {
                  console.log("ws: ", workspace);
                  return (
                    <div className="board-container" key={board.id}>
                      <div
                        className="card"
                        style={{
                          backgroundImage: board.photo
                            ? `url(https://back.alyoumsa.com/storage/app/public/boards/${board.photo})`
                            : `url(${bgimg})`,
                        }}
                      >
                        <Link
                          className="board-link"
                          to={`board/${workspace.id}/${board.id}`}
                        >
                          <div className="card-content">
                            <p className="board-name">{board.name}</p>
                          </div>
                        </Link>
                        <Dropdown>
                          <Dropdown.Toggle
                            as="button"
                            drop="down"
                            className="custom-dropdown-toggle p-0 no-caret"
                          >
                            <span
                              className="vertical-dots"
                              style={{ color: "white" }}
                            >
                              ⋮
                            </span>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                handleEditClick(
                                  board.id,
                                  board.name,
                                  board.photo
                                )
                              }
                            >
                              <i className="fa-regular fa-pen-to-square me-2"></i>{" "}
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleDeleteClick(workspace.id, board.id)
                              }
                              className="text-danger"
                            >
                              <i className="fa-regular fa-trash-can me-2"></i>{" "}
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal show={showModal} onHide={handleCancelEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Board</Modal.Title>
        </Modal.Header>
        <Modal.Body
        style={{
          width: '100%',
          overflow: 'hidden',
          padding:'20px 30px '
        }}
        >
          <Form.Group controlId="formBoardName">
            <Form.Label>Board Name</Form.Label>
            <Form.Control
              type="text"
              value={editedBoardName}
              onChange={(e) => setEditedBoardName(e.target.value)}
              placeholder="Enter new board name"
            />
          </Form.Group>
          <Form.Group controlId="formBoardPhoto">
            <Form.Label>Board Photo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("File size should not exceed 5MB");
                  return;
                }
                setEditedBoardPhoto(file);
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => {
              e.preventDefault();

              const workspace = workSpaces.find((ws) =>
                ws.boards_of_the_workspace.some((b) => b.id === editingBoardId)
              );

              if (!workspace || !editedBoardName) {
                alert("Please make sure to fill all required fields.");
                return;
              }

              handleSaveClick(workspace.id, editingBoardId);
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showWorkspaceModal}
        onHide={() => setShowWorkspaceModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Workspace Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWorkspaceName">
            <Form.Label>Workspace Name</Form.Label>
            <Form.Control
              type="text"
              value={editedWorkspaceName}
              onChange={(e) => setEditedWorkspaceName(e.target.value)}
              placeholder="Enter new workspace name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWorkspaceModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveWorkspaceClick}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <button
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          backgroundColor: "#b6c2cf",
          color: "#1c2b41",
          borderRadius: "50%",
          cursor: "pointer",
          width: "50px",
          height: "50px",
          fontWeight: "bold",
          border: "none",
        }}
        onClick={() => setOpenPopUp(!openPopUp)}
      >
        msg
      </button>
      {openPopUp && <PopupMsg workSpaces={workSpaces} allUsers={allUsers} />}
    </div>
  );
}

export default Workspace;
