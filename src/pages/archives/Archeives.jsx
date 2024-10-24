import React, { useEffect, useState } from "react";
import NavBar from "../../components/navbar/Navbar";
import SideBar from "../../components/sideBar/SideBar";

import deletePer from "../../../public/deletePer.svg";
import restore from "../../../public/restore.svg";

import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

import "./Archeives.css";

import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import api from "../../apiAuth/auth";

function Archeives() {
  const [show, setShow] = useState(true);
  const [archeivedCard, setarcheivedCard] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeAgo = new TimeAgo("en-US");

  const { boardID } = useParams();

  const cookies = Cookies.get("token");
  useEffect(() => {
    const getWorkSpace = async () => {
      try {
        const { data } = await api({
          url: `boards/get-archived-cards/${boardID}`,
          // Authorization: `Bearer ${cookies?.token}`,
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setarcheivedCard(data.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getWorkSpace();
  }, [boardID]);

  useEffect(() => {
    if (!show) {
      document.querySelector(".views")?.classList.add("large");
    } else {
      document.querySelector(".views")?.classList.remove("large");
    }
  }, [show]);

  const handleArchivedUser = async (id, type) => {
    if (type == "restore") {
      try {
        await api({
          url: `boards/restore-archived-card/${id}`,
          method: "POST",
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setarcheivedCard(archeivedCard.filter((card) => card.id !== id));
        alert("Card successfully restore to the board");
      } catch (err) {
        console.error("API error:", err);
      }
    } else {
      try {
        await api({
          url: `boards/delete-archived-card/${id}`,
          method: "POST",
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setarcheivedCard(archeivedCard.filter((card) => card.id !== id));
        alert("Card successfully deleted from the board permanently");
      } catch (err) {
        console.error("API error:", err);
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

  return (
    <>
      <NavBar setShow={setShow} disableAdding={true} />
      <SideBar show={show} setShow={setShow} />

      <div style={{ overflowX: "scroll", minHeight: "100vh" }}>
        <div className="archeived-cards views">
          <div className="container">
            <table>
              <thead>
                <tr>
                  <th>Card No.</th>
                  <th>Card Title</th>
                  <th>Date</th>
                  <th>Who Deleted The card</th>
                  <th> Actions</th>
                </tr>
              </thead>
              <tbody>
                {archeivedCard.map((card, i) => (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>{card.text}</td>
                    <td>{new Date(card.created_at).toLocaleString()}</td>
                    <td>{card.user_name}</td>
                    <td>
                      <img
                        style={{
                          marginInline: "5px",
                          width: "25px",
                          height: "25px",
                          cursor: "pointer",
                        }}
                        src={deletePer}
                        alt=""
                        onClick={() => handleArchivedUser(card.id, "delete")}
                      />
                      <img
                        style={{
                          marginInline: "5px",
                          width: "25px",
                          height: "25px",
                          cursor: "pointer",
                        }}
                        src={restore}
                        alt=""
                        onClick={() => handleArchivedUser(card.id, "restore")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Archeives;
