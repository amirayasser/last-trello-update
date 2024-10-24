import React, { useEffect, useState } from "react";
import NavBar from "../../components/navbar/Navbar";
import SideBar from "../../components/sideBar/SideBar";

import deletePer from "../../../public/deletePer.svg";
import restore from "../../../public/restore.svg";

import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

import "./AllMembers.css";
import "../archives/Archeives.css";

import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import api from "../../apiAuth/auth";

function AllMembers() {
  const [show, setShow] = useState(true);
  const [users, setusers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { boardID } = useParams();

  const cookies = Cookies.get("token");
  useEffect(() => {
    const getWorkSpace = async () => {
      try {
        const { data } = await api({
          url: `users/get-users`,
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setusers(data.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getWorkSpace();
  }, [boardID]);

  const deleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this User")) {
      try {
        const { data } = await api({
          url: `users/destroy/${id}`,
          headers: { Authorization: `Bearer ${cookies}` },
          method: "DELETE",
        });
        setusers((prev) => prev.filter((user) => user.id !== id));
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    }
  };

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
    <>
      <NavBar setShow={setShow} disableAdding={true} />
      <SideBar show={show} setShow={setShow} />

      <div style={{ overflowX: "scroll", minHeight: "100vh" }}>
        <div className="archeived-cards views">
          <div className="container">
            <table>
              <thead>
                <tr>
                  <th>User No.</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th> Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
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
                        onClick={() => deleteUser(user.id)}
                      />
                      {/* <img
                        style={{
                          marginInline: "5px",
                          width: "25px",
                          height: "25px",
                          cursor: "pointer",
                        }}
                        src={restore}
                        alt=""
                        onClick={() => handleArchivedUser(card.id, "restore")}
                      /> */}
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

export default AllMembers;
