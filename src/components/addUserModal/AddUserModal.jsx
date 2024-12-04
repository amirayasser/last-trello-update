import axios from 'axios';
import React from 'react'
import './addUserModal.css';
import { useState } from "react";
import { Form } from 'react-bootstrap';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { IoPersonAddOutline } from "react-icons/io5";

const AddUserModal = () => {
     const [show, setShow] = useState(false);


     const [newUser, setNewUser] = useState({
        name: "",
        role: "user",
        email: "",
        password: "",
     });

     const handleClose = () => setShow(false);
     const handleShow = () => setShow(true);

     const handleInputChange = (e) => 
        {
            const {id, value} = e.target
            setNewUser((prevData)=> ({...prevData, [id]:value}));
        }
        const handleSubmit = async (e) => {
            e.preventDefault();

            try {

              const token = JSON.parse(localStorage.getItem("user")).token;

               if (!token) {
                 throw new Error(
                   "Authentication token not found. Please log in."
                 );
               }

               const config = {
                 headers: {
                   Authorization: `Bearer ${token}`,
                 },
               };
                const response = await axios.post(
                  "https://back.alyoumsa.com/public/api/users/create",
                  newUser,
                  config
                  
                );
                console.log("User added successfully:", response.data);
                handleClose();
            } catch (error) {

                      console.error(
                        "Error adding user:",
                        error.response?.data || error.message
                      );

            }
        }
     

  return (
    <>
      <Button
        onClick={handleShow}
        className="adduserBtn board-item  text-center"
      >
        <IoPersonAddOutline />
        add user
      </Button>

      <Modal show={show} onHide={handleClose} centered className="adduserModal">
        <Modal.Header closeButton>
          <Modal.Title>add new user</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: "hidden", width: "100%" }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 w-50">
              <label htmlFor="name" className="form-label text-secondary">
                User Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={newUser.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3 mt-4 w-50">
              <label htmlFor="role" className="form-label text-secondary">
                Role
              </label>
            </div>
            <div className="mb-3 mt-4  w-50">
              <select
                className="form-select"
                id="role"
                value={newUser.role}
                onChange={handleInputChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label text-secondary">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label text-secondary">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddUserModal;
