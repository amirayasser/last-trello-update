import { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import './ProfileCard.css';
import { IoClose} from "react-icons/io5";
import { AuthContext } from "../context/Auth";

function ProfileCard() {
  const [show, setShow] = useState(false);
  const { user } = useContext(AuthContext);

  const handleToggle = () => setShow(!show);

  return (
    <div style={{ position: "relative" }}>
      <Button
        className="profileCircle"
        onClick={handleToggle}
      >
        {user.name.split(" ")[0].charAt(0).toUpperCase()}
        {user.name.split(" ")[1]?.charAt(0).toUpperCase()}
      </Button>

      <div className={`profileModal ${show ? "show" : "hide"}`}>
        <IoClose
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            color: "white",
            fontSize: "20px",
          }}
          onClick={() => setShow(false)}
        />
        <header>
          <div className="nameCircle">
            {user.name.split(" ")[0].charAt(0).toUpperCase()}{" "}
            {user.name.split(" ")[1]?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </header>
        <div className="modalBody">
          <button>edit profile info</button>
          <hr />
          <button>view member activity</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
