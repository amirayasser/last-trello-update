import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import Cookies from "js-cookie";

import "./Workspace.css";
import { Link, useParams } from "react-router-dom";
import NavBar from "../../components/navbar/Navbar";
import SideBar from "../../components/sideBar/SideBar";
import api from "../../apiAuth/auth";
import Spinner from "react-bootstrap/esm/Spinner";

function MyVerticallyCenteredModal(props) {
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);

  const { workspaceId } = useParams();
  const cookies = Cookies.get("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/get-users", {
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setUsers(data.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, [cookies]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    try {
      console.log(
        "Inviting user:",
        selectedUsers,
        "to workspace:",
        workspaceId
      );
      await api.post(
        "/workspaces/assign-user-to-workspace",
        {
          workspace_id: workspaceId,
          user_id: [selectedUsers],
        },
        {
          headers: { Authorization: `Bearer ${cookies} ` },
        }
      );
      alert("User(s) successfully assigned to the workspace!");
      props.onHide();
    } catch (err) {
      console.error("API error:", err);
      const responseMessage = err.response?.data?.message;
      const errorMessage = responseMessage || "An unexpected error occurred";

      if (err.response?.status === 422) {
        if (responseMessage.includes("already a member")) {
          alert("One or more users are already members of this workspace.");
        } else {
          setError(`Validation Error: ${errorMessage}`);
        }
      } else if (err.response?.status === 400) {
        setError(`Bad Request: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleUserSelect = (event) => {
    const value = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setSelectedUsers(Number(value[0]));
  };

  const fetchWorkspaceUsers = async () => {
    try {
      const response = await api.get(
        `/workspaces/get-workspace/${workspaceId}`,
        {
          headers: { Authorization: `Bearer ${cookies}` },
        }
      );
      setWorkspaceUsers(response.data.result.users);
    } catch (err) {
      console.error("Error fetching workspace users:", err);
      setError("Failed to fetch workspace users");
    }
  };

  // remove user from workspace

  const handleRemoveUserFromWorkspace = async () => {
    await fetchWorkspaceUsers();

    const userInWorkspace = workspaceUsers.some(
      (user) => user.user_id == selectedUsers
    );

    if (!userInWorkspace) {
      alert("User is not in the workspace!");
      return;
    }

    try {
      await api.post(
        "workspaces/remove-user-from-workspace",
        // {
        //   headers: { Authorization: `Bearer ${cookies}` },
        // },

        // { user_id: Number(selectedUsers), wsporkace_id: Number(workspaceId) }
        {
          user_id: Number(selectedUsers),
          workspace_id: Number(workspaceId),
        },
        {
          headers: { Authorization: `Bearer ${cookies}` },
        }
      );

      setWorkspaceUsers(
        workspaceUsers.filter((user) => user.user_id !== selectedUsers)
      );
      alert("User successfully removed from the workspace!");
    } catch (err) {
      console.error("API error:", err);

      const responseMessage =
        err.response?.data?.message || "An unexpected error occurred";
      console.error("Detailed error response:", err.response);

      if (err.response?.status === 422) {
        setError(`Validation Error: ${responseMessage}`);
      } else if (err.response?.status === 400) {
        setError(`Bad Request: ${responseMessage}`);
      } else {
        setError(responseMessage);
      }
    }
  };

  useEffect(() => {
    fetchWorkspaceUsers();
  }, []);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Invite to Workspace
        </Modal.Title>
      </Modal.Header>
      <label
        value=""
        style={{ fontSize: "18px", marginLeft: "20px", marginTop: "25px" }}
      >
        Select users...
      </label>
      <Modal.Body>
        <Form style={{ marginTop: "-10px" }}>
          <Form.Group controlId="userSelect">
            <Form.Label>Select Users</Form.Label>
            <Form.Select
              multiple
              aria-label="Select users"
              onChange={handleUserSelect}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
        {/* <div className="ivite">
          <p>Invite someone to this Workspace with a link:</p>
          <a href="#">
            <img src="link.svg" alt="" />
            Create Link
          </a>
        </div> */}
        {error && <p className="error">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleInvite}>Invite</Button>
        <Button
          onClick={() => handleRemoveUserFromWorkspace()}
          className="btn-danger"
        >
          Remove
        </Button>
        <Button className="btn-info" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Workspace() {
  const [show, setShow] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workSpace, setworkSpace] = useState({});

  const { workspaceId } = useParams();

  const cookies = Cookies.get("token");
  useEffect(() => {
    const getWorkSpace = async () => {
      try {
        const { data } = await api({
          url: `workspaces/get-workspace/${workspaceId}`,
          // Authorization: `Bearer ${cookies?.token}`,
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setworkSpace(data.result);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getWorkSpace();
  }, [workspaceId]);

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
  console.log(show);

  return (
    <>
      <NavBar setShow={setShow} />
      <SideBar workSpace={workSpace} show={show} setShow={setShow} />

      <div className="views">
        <div className="workspace views-wrapper">
          <div className="header">
            <div className="left">
              <h2>{workSpace.name} Workspace</h2>
            </div>
            <div className="right">
              <Button
                className="invite-link"
                variant="primary"
                onClick={() => setModalShow(true)}
              >
                <svg
                  width="24"
                  height="24"
                  role="presentation"
                  focusable="false"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 9.44777 7.61532 10.7518 8.59871 11.6649C5.31433 13.0065 3 16.233 3 20C3 20.5523 3.44772 21 4 21H12C12.5523 21 13 20.5523 13 20C13 19.4477 12.5523 19 12 19H5.07089C5.55612 15.6077 8.47353 13 12 13ZM15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M17 14C17 13.4477 17.4477 13 18 13C18.5523 13 19 13.4477 19 14V16H21C21.5523 16 22 16.4477 22 17C22 17.5523 21.5523 18 21 18H19V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V18H15C14.4477 18 14 17.5523 14 17C14 16.4477 14.4477 16 15 16H17V14Z"
                    fill="currentColor"
                  ></path>
                </svg>
                Invite Workspace members
              </Button>

              <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
              />
            </div>
          </div>
          <div className="body ">
            <h2>Boards</h2>
            {/* <div className="filters">
              <div className="left">
                <div className="item">
                  <label htmlFor="">Sort by</label>
                  <Form.Select aria-label="Default select example">
                    <option> select sort</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </div>
                <div className="item">
                  <label htmlFor="">Filter by</label>
                  <Form.Select aria-label="Default select example">
                    <option> select filter </option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </div>
              </div>
              <div className="right">
                <label htmlFor="">Search</label>

                <div className="item">
                  <Form.Control size="md" type="text" placeholder="Search" />
                </div>
              </div>
            </div> */}
            <div className="views">
              <div className="workspace-item">
                <div className="wrapper">
                  {workSpace.boards_of_the_workspace.map((board) => (
                    <Link
                      key={board.board_id}
                      className="board-link"
                      to={`/board/${workspaceId}/${board.id}`}
                    >
                      <div className="card">
                        <img
                          src={
                            board.photo
                              ? `https://back.alyoumsa.com/public/storage/${board.photo}`
                              : "/photo-1675981004510-4ec798f42006.jpg"
                          }
                          alt=""
                        />
                        <p style={{ padding: "8px" }}>{board.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Workspace;
