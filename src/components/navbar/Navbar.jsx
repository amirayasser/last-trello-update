import { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Cookies from "js-cookie";
import api from "../../apiAuth/auth";
import { AuthContext } from "../context/Auth";
import "./navbar.css";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";

function NavBar({ workSpaces, setShow, setworkSpaces, disableAdding }) {
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const { user, dispatch } = useContext(AuthContext);
  const workspaceTitle = useRef(null);
  const boardTitle = useRef(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const navigate = useNavigate();
  const [shouldFetchAssignedUsers, setShouldFetchAssignedUsers] =
    useState(false);

  const location = useLocation();
  const path = location.pathname;
  const pathName = path.split("/")[1];

  const cookies = Cookies.get("token");
  const { workspaceId, boardId } = useParams();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/get-users", {
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setUsers(data.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message);
      }
    };

    fetchUsers();
  }, [cookies]);

  const addBoard = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/boards/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          name: boardTitle.current.value,
          workspace_id: workspaceId,
        },
      });
      navigate(`/board/${workspaceId}/${data.data.id}`);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "somting went wrong");
    }
  };

  const addWorkspace = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/workspaces/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { name: workspaceTitle.current.value },
      });
      setworkSpaces((prev) => [...prev, data.result]);
      document.querySelector(".create .dropdown-menu").classList.remove("show");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const { data } = await api.get(`/boards/get-board/${boardId}`, {
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setAssignedUsers(data.data.users);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message);
      }
    };

    if (boardId) {
      fetchAssignedUsers();
      setShouldFetchAssignedUsers(false);
    }
  }, [cookies, boardId, shouldFetchAssignedUsers]);

  const handleUserClick = async (userId) => {
    const isAssigned = assignedUsers.some((user) => user.user_id === userId);
    try {
      if (isAssigned) {
        if (
          confirm("user already exist in the board do you want to delete it")
        ) {
          await api.post(
            "/boards/remove-user-from-board",
            {
              board_id: boardId,
              user_id: userId,
            },
            {
              headers: { Authorization: `Bearer ${cookies}` },
            }
          );
          setAssignedUsers(assignedUsers.filter((user) => user.id !== userId));
          alert("User successfully removed from the board!");
        }
      } else {
        await api.post(
          "/boards/assign-user-to-board",
          {
            board_id: boardId,
            user_id: [userId],
          },
          {
            headers: { Authorization: `Bearer ${cookies}` },
          }
        );
        setAssignedUsers([
          ...assignedUsers,
          users.find((user) => user.id === userId),
        ]);
        alert("User successfully assigned to the board!");
      }

      setShouldFetchAssignedUsers(true);
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

  const handleLogout = async () => {
    try {
      await api.post(
        "/logout",
        {},
        {
          headers: { Authorization: `Bearer ${cookies}` },
        }
      );
      Cookies.remove("token");
      dispatch({ type: "logout" });

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err.message || "Unknown error");
      setError(err.response?.data?.message || "Failed to log out.");
    }
  };
  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.gif"
            style={{
              width: "80px",
              height: "30px",
              objectFit: "contain",
              borderRadius: "5px",
            }}
            alt=""
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            {pathName === "" ? (
              <NavDropdown title="Workspaces" id="navbarScrollingDropdown">
                {workSpaces.map((workspace) => (
                  <NavDropdown.Item
                    key={workspace.id}
                    as={Link}
                    to={`/workspace/${workspace.id}`}
                  >
                    {workspace.name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            ) : (
              ""
            )}

            {pathName === "board" && (
              <NavDropdown
                title="Invite Board Members"
                id="navbarScrollingDropdown"
              >
                {users.map((user) => (
                  <NavDropdown.Item
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                  >
                    {user.email}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            )}
            {pathName !== "board" &&
            pathName !== "workspace" &&
            !disableAdding ? (
              <NavDropdown
                title="Create Workspace"
                id="navbarScrollingDropdown"
                className="create"
                onClick={() => setShow(false)}
              >
                <form className="container" onSubmit={addWorkspace}>
                  <h2>Workspace</h2>
                  <div className="input-wrapper">
                    <label htmlFor="">Workspace title *</label>
                    <input
                      ref={workspaceTitle}
                      type="text"
                      required
                      autoFocus
                    />
                  </div>
                  <Button type="submit" variant="primary">
                    Create Workspace
                  </Button>
                  {error && <span className="err">{error}</span>}
                </form>
              </NavDropdown>
            ) : (
              !disableAdding && (
                <NavDropdown
                  title="Create Board"
                  id="navbarScrollingDropdown"
                  className="create"
                  onClick={() => setShow(false)}
                >
                  <form className="container" onSubmit={addBoard}>
                    <h2>Board</h2>
                    <div className="input-wrapper">
                      <label htmlFor="">Board title *</label>
                      <input ref={boardTitle} type="text" required autoFocus />
                    </div>
                    <Button type="submit" variant="primary">
                      Create Board
                    </Button>
                    {error && <span className="err">{error}</span>}
                  </form>
                </NavDropdown>
              )
            )}
          </Nav>
          <Form className="d-flex">
            <form
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              onClick={(e) => {
                setShow(false);
              }}
            >
              <input
                placeholder="Search"
                aria-label="Search"
                type="search"
                class="me-2 form-control"
                onClick={(e) => {
                  e.target.focus();
                }}
                autoFocus
              ></input>
            </form>
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  className="user-name no-caret"
                  id="dropdown-basic"
                >
                  {user.name.split(" ")[0].charAt(0).toUpperCase()}
                  {"."}
                  {user.name.split(" ")[1]?.charAt(0)?.toUpperCase()}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login">
                <img
                  src="/avatar.jpg"
                  alt=""
                  style={{ width: "40px", height: "40px" }}
                />
              </Link>
            )}
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
