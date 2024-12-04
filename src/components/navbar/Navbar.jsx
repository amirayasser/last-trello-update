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
import ChangeBoardBg from '../changeBoardBg/ChangeBoardBg';

function NavBar({
  workSpaces,
  setShow,
  setworkSpaces,
  disableAdding,
  boardBg,
  currWSUsers,
  allUsers,
  setAllUsers,
}) {
  const [error, setError] = useState(null);
  // const [users, setUsers] = useState([]);
  const { user, dispatch } = useContext(AuthContext);
  const workspaceTitle = useRef(null);
  const boardTitle = useRef(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const navigate = useNavigate();
  const [shouldFetchAssignedUsers, setShouldFetchAssignedUsers] =
    useState(false);

  const [showBGBoard, setShowBg] = useState(true);
  const [visibility, setVisibility] = useState("workspace");
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [image, setImage] = useState(null);

  const location = useLocation();
  const path = location.pathname;
  const pathName = path.split("/")[1];

  const cookies = Cookies.get("token");
  const { workspaceId, boardId } = useParams();

  const handleChange = (event) => {
    const options = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setSelectedOptions(options);
    console.log(options);
  };
  console.log("curr user :", user);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const { data } = await api.get("/users/get-users", {
        headers: { Authorization: `Bearer ${cookies}` },
      });
      console.log("Fetched users:", data);
      setAllUsers(data.data); // Ensure 'data.data' matches your API structure
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      console.log("Fetch complete");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookies) {
      fetchUsers();
    }
  }, [cookies]);


const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    setImage(file); // حفظ الملف المختار مباشرة
    console.log("Selected image file:", file);
  } else {
    alert("Please select a valid image file.");
  }
};
// فيه مشكله فى رفع الصوره بتاعت البورد هنا ايرور 422
const addBoard = async (e) => {
  e.preventDefault();
  setError(null); // تعيين error إلى null قبل محاولة إضافة الـ board

  let imageUrl = null;
  let boardData = {}; // تعريف كائن فارغ مبكرًا لتجنب undefined

  try {
    // رفع الصورة إذا كانت موجودة
    if (image) {
      console.log("Attempting to upload the image...");
      const formData = new FormData();
      formData.append("photo", image);

      console.log("FormData contains:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      try {
        const photoResponse = await api({
          url: `/boards/upload/${workspaceId}`,
          method: "POST",
          headers: { Authorization: `Bearer ${cookies}` },
          data: formData,
        });

        if (photoResponse.data.success) {
          imageUrl = photoResponse.data.data.photo; // مسار الصورة بعد رفعها
          console.log("Photo uploaded successfully:", imageUrl);
        } else {
          console.error(
            "Failed to upload image. Response:",
            photoResponse.data
          );
          throw new Error("Image upload failed.");
        }
      } catch (uploadError) {
        console.error("Error while uploading image:", uploadError);
        throw new Error("Image upload failed.");
      }
    }

    // إعداد البيانات قبل إرسالها
    boardData = {
      name: boardTitle.current.value || "Untitled Board",
      workspace_id: workspaceId,
      visibility: visibility,
      user_ids: visibility === "private" ? selectedUsersIds : [],
      photo: imageUrl, // حتى لو كانت null
    };

    console.log("Prepared boardData:", boardData);

    // إضافة الـ board
    const { data } = await api({
      url: "/boards/create",
      method: "POST",
      headers: { Authorization: `Bearer ${cookies}` },
      data: boardData,
    });

    console.log("Board created successfully:", data);
    navigate(`/board/${workspaceId}/${data.data.id}`);
    setError(null);
  } catch (err) {
    console.error("Error occurred:", err);

    // طباعة البيانات حتى لو كانت غير مكتملة
    console.log("Failed data:", {
      imageUrl: imageUrl || "Image upload failed or not provided",
      boardData: Object.keys(boardData).length
        ? boardData
        : "Board data not prepared yet",
    });

    // طباعة الخطأ الكامل
    console.error("Full error response:", err.response);

    setError(err.response?.data?.message || "Something went wrong");
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
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message);
      setTimeout(() => {
        setError(null);
      }, 3000);
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
          allUsers.find((user) => user.id === userId),
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
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  console.log("user name: ", user?.name);

  console.log("users", allUsers);

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
              <NavDropdown
                title="Workspaces"
                id="navbarScrollingDropdown"
                className="workspacesMenu"
              >
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

            {/* {pathName === "board" && (
              <NavDropdown
                title="Invite Board Members"
                id="navbarScrollingDropdown"
              >
                {allUsers &&
                  allUsers.length > 0 &&
                  allUsers.map((user) => (
                    <NavDropdown.Item
                      key={user.id}
                      onClick={() => handleUserClick(user.id)}
                    >
                      {user.email}
                    </NavDropdown.Item>
                  ))}
              </NavDropdown>
            )} */}

            {user?.role === "admin" &&
            pathName === "" &&
            pathName !== "board" &&
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
                  {error && (
                    <span
                      className="err"
                      style={{
                        backgroundColor: "#ffc5c9",
                        color: "#212529",
                        padding: "8px",
                        fontWeight: "500",
                        fontSize: "12px",
                        borderRadius: "5px",
                        marginBottom: "8px",
                      }}
                    >
                      {error}
                    </span>
                  )}
                </form>
              </NavDropdown>
            ) : (
              !disableAdding &&
              pathName !== "" && (
                <NavDropdown
                  title="Create Board"
                  id="navbarScrollingDropdown"
                  className="create"
                  onClick={() => setShow(false)}
                >
                  <form className="container" onSubmit={addBoard}>
                    <h2>Board</h2>
                    <div
                      className="input-wrapper"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* <label htmlFor="">Board title</label> */}
                      <input
                        ref={boardTitle}
                        type="text"
                        required
                        autoFocus
                        placeholder="title"
                      />
                      <Form.Select
                        aria-label="Default select example"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                      >
                        <option value="public">public</option>
                        <option value="private">private</option>
                        <option value="workspace">workspace</option>
                      </Form.Select>
                      {visibility === "private" && (
                        <select
                          multiple
                          onChange={(e) =>
                            setSelectedUsersIds(
                              Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              )
                            )
                          }
                        >
                          {currWSUsers &&
                            currWSUsers?.length > 0 &&
                            currWSUsers?.map((user) => (
                              <option key={user.user_id} value={user.user_id}>
                                {user.user_name}
                              </option>
                            ))}
                        </select>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange} // يتم رفع الصورة عند اختيارها
                      />
                    </div>
                    <Button type="submit" variant="primary">
                      Create Board
                    </Button>
                    {/* {error && (
                      <span
                        className="err"
                        style={{
                          backgroundColor: "#ffc5c9",
                          color: "#212529",
                          padding: "8px",
                          fontWeight: "500",
                          fontSize: "12px",
                          borderRadius: "5px",
                          marginBottom: "8px",
                        }}
                      >
                        {error}
                      </span>
                    )} */}
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
                className="me-2 form-control"
                onClick={(e) => {
                  e.target.focus();
                }}
                autoFocus
              ></input>
            </form>
            {user ? (
              <Dropdown align="end" style={{ borderRadius: "50%" }}>
                <Dropdown.Toggle
                  className="user-name no-caret"
                  id="dropdown-basic"
                >
                  {user.name.split(" ")[0].charAt(0).toUpperCase()}
                  {"."}
                  {user.name.split(" ")[1]?.charAt(0)?.toUpperCase()}
                </Dropdown.Toggle>

                <Dropdown.Menu className="log-GD">
                  <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowBg(!showBGBoard)}>
                    change board bg
                  </Dropdown.Item>
                  {showBGBoard && <ChangeBoardBg />}
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
