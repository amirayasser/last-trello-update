import attach from "../../../public/attach.svg";
import deleteimage from "../../../public/delete.svg";
import coveru from "../../../public/coveru.svg";
import deleteDate from "../../../public/deleteDate.svg";
import deleteCover from "../../../public/deleteCover.svg";
import move from "../../../public/move.svg";
import copy from "../../../public/copy.svg";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

import ModalImage from "react-modal-image";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Form from "react-bootstrap/Form";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AuthContext } from "../context/Auth";

import "./CardDetails.css";
import { useRef, useState, useContext } from "react";

import Cookies from "js-cookie";
import api from "../../apiAuth/auth";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import Comment from "../comment/Comment";
import { MdOutlineEdit } from "react-icons/md";
import { FaRegCreditCard } from "react-icons/fa6";

const CalendarIcon = () => {
  return (
    <div style={{ color: "white" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 48 48"
      >
        <mask id="ipSApplication0">
          <g fill="white" stroke="white" strokeLinejoin="round" strokeWidth="4">
            <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
            <path
              fill="White"
              d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
            ></path>
          </g>
        </mask>
        <path
          fill="white"
          d="M0 0h48v48H0z"
          mask="url(#ipSApplication0)"
        ></path>
      </svg>
      Date
    </div>
  );
};

function CardDetails({
  onCloseModal,
  open,
  listId,
  onDeleteCard,
  setcardDetails,
  cardDetails,
  board,
  files,
  setSelectedFile,
}) {
  const toolbarOptions = [
    ["bold", "italic"],
    ["link", "image"],
  ];

  const module = {
    toolbar: toolbarOptions,
  };

  const cookies = Cookies.get("token");

  const { user } = useContext(AuthContext);

  const [fileURL, setFileURL] = useState([]);

  const [activeMovinglist, setactiveMovinglist] = useState(
    board.lists_of_the_board[0].id
  );

  const [newPosotion, setnewPosotion] = useState(1);

  const [showdetails, setshowdetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editText, seteditText] = useState(false);
  const [addItems, setaddItems] = useState({
    title: false,
    desc: false,
    comment: false,
  });

  const newComment = useRef(null);

  // changes
  const handleDelete = async () => {
    try {
      const response = await api({
        url: `/cards/destroy/${cardDetails.id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${cookies}` },
      });

      if (response.ok || response.status === 204 || response.status === 203) {
        console.log("Card deleted successfully");
        onDeleteCard(cardDetails.id);
        onCloseModal();
        alert("Card deleted successfully");
      } else {
        console.error(
          "Failed to delete the cardDetails. Status:",
          response.status
        );
      }
    } catch (error) {
      console.error("An error occurred while deleting the card:", error);
    }
  };

  const movingRequest = async (type) => {
    try {
      const response = await api({
        url:
          type == "move"
            ? `cards/move-card/${cardDetails.id}`
            : `cards/copy-card/${cardDetails.id}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: { the_list_id: activeMovinglist, position: newPosotion },
      });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(files);
  const handleCoverUpload = async (event) => {
    let uploadedfiles = event.target.files;
    if (!uploadedfiles) return;
    setSelectedFile(
      Array.from(uploadedfiles).map((file) => {
        return {
          type: file.type,
          name: file.name,
          file_path: URL.createObjectURL(file),
        };
      })
    );

    try {
      const response = await api({
        url: `/cards/store-files`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
          "Content-Type": "multipart/form-data",
        },
        data: { files: uploadedfiles, card_id: cardDetails.id },
      });
    } catch (error) {
      console.error(
        "Error uploading cover image:",
        error.response?.data || error.message
      );
    }
  };

  const openItem = (name) => {
    setaddItems((prev) => {
      return {
        ...prev,
        [name]: true,
      };
    });
  };
  const closeItem = (name) => {
    setaddItems((prev) => {
      return {
        ...prev,
        [name]: false,
      };
    });
  };

  const updateDate = async (name, value) => {
    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;
    setcardDetails((prev) => {
      return {
        ...prev,
        start_time: value,
      };
    });
    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo ? other.photo.replace("/storage/", "") : "",
          card_id: cardDetails.id,
          the_list_id: listId,
          start_time: value,
        },
        method: "post",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateDetails = (name, value) => {
    setcardDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const updateDateState = async (e) => {
    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;
    setcardDetails((prev) => {
      return {
        ...prev,
        completed: e.target.checked,
      };
    });
    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo ? other.photo.replace("/storage/", "") : "",
          card_id: cardDetails.id,
          the_list_id: listId,
          completed: e.target.checked,
        },
        method: "post",
      });
    } catch (err) {
      console.log(err);
    }
  };
  const updateCoverColor = (e, deleteColor) => {
    setcardDetails((prev) => {
      return {
        ...prev,
        color: deleteColor ? "" : e.target.value,
      };
    });
  };

  const handleChangeColorRequest = async (e, deleteColor) => {
    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;
    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo && other.photo.replace("/storage/", ""),
          card_id: cardDetails.id,
          the_list_id: listId,
          color: deleteColor ? "" : cardDetails.color,
        },
        method: "post",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateRequest = async (e) => {
    e.preventDefault();

    const {
      user_name,
      comments,
      labels,
      updated_at,
      created_at,
      id,
      card_details,
      ...other
    } = cardDetails;

    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...other,
          photo: other.photo ? other.photo.replace("/storage/", "") : "",
          card_id: cardDetails.id,
          the_list_id: listId,
        },
        method: "post",
      });
      closeItem("desc");
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    closeItem("comment");
    try {
      const { data } = await api({
        url: "/comments/create",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { card_id: cardDetails.id, comment: newComment.current.value },
        method: "post",
      });
      setcardDetails((prev) => {
        return {
          ...prev,
          comments: [
            ...prev.comments,
            { comment: data.result.comment, comment_id: data.result.id },
          ],
        };
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const url = `/cards/delete-file/${cardDetails.id}`;
      const response = await api(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies}`,
        },
      });

      alert("Photo removed successfully");
      setcardDetails((prev) => ({
        ...prev,
        photo: "",
      }));
    } catch (error) {
      console.error("Error removing photo:", error);
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
    <div>
      {" "}
      <Modal classNames="card-modal" open={open} onClose={onCloseModal} center>
        <div className="modal-body">
          {cardDetails?.color && (
            <div
              className="cover-image"
              style={{
                background: cardDetails.color,
                height:'116px',
              }}
            ></div>
          )}
          {editText ? (
            <form onSubmit={updateRequest}>
              <input
                required
                style={{ width: "60%", marginBottom: "15px" }}
                value={cardDetails.text}
                autoFocus
                onChange={(e) => updateDetails("text", e.target.value)}
                onBlur={() => seteditText(false)}
              />
            </form>
          ) : (
            <h2 
            style={{
              fontSize:'20px',
              display:'flex',
              alignItems:'center',
              gap:'5px',
              
            }}
            onClick={() => seteditText(true)}>
              <FaRegCreditCard/>
              {cardDetails.text}
              </h2>
          )}
          <div className="wrapper">
            <div className="left">
              {cardDetails.start_time && (
                <div className="date-wrapper">
                  <Form.Check
                    type="checkbox"
                    checked={cardDetails.completed}
                    onChange={updateDateState}
                  />
                  <div className="state-wrapper">
                    <DatePicker
                      showTimeSelect={false}
                      showTimeInput
                      dateFormat="MM/dd/yyyy h:mm aa"
                      selected={cardDetails.start_time}
                      onChange={(e) => updateDate("start_time", e)}
                    />
                    {cardDetails.completed ? (
                      <div className="state">Completed</div>
                    ) : (new Date(cardDetails.start_time) - new Date()) /
                        (1000 * 60 * 60 * 24) >
                      1 ? (
                      <div
                        className="state"
                        style={{ background: "transparent" }}
                      ></div>
                    ) : (new Date(cardDetails.start_time) - new Date()) /
                        (1000 * 60 * 60 * 24) >
                      0 ? (
                      <div className="state" style={{ background: "yellow" }}>
                        Soon
                      </div>
                    ) : (
                      <div className="state" style={{ background: "red" }}>
                        Over Date
                      </div>
                    )}
                  </div>
                  <img
                    src={deleteDate}
                    style={{ width: "20px", cursor: "pointer" }}
                    onClick={() => updateDate("start_time", "")}
                    alt=""
                  />
                </div>
              )}
              <div className="description">
                <div
                  className="header"
                  style={{ cursor: "pointer" }}
                  onClick={() => openItem("desc")}
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
                      d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM4 9C3.44772 9 3 9.44772 3 10C3 10.5523 3.44772 11 4 11H20C20.5523 11 21 10.5523 21 10C21 9.44772 20.5523 9 20 9H4ZM3 14C3 13.4477 3.44772 13 4 13H20C20.5523 13 21 13.4477 21 14C21 14.5523 20.5523 15 20 15H4C3.44772 15 3 14.5523 3 14ZM4 17C3.44772 17 3 17.4477 3 18C3 18.5523 3.44772 19 4 19H14C14.5523 19 15 18.5523 15 18C15 17.4477 14.5523 17 14 17H4Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  Description
                </div>
                <form onSubmit={updateRequest}>
                  {addItems.desc ? (
                    <>
                      <ReactQuill
                        theme="snow"
                        modules={module}
                        value={cardDetails.description}
                        onChange={(e) => updateDetails("description", e)}
                      />
                      <div className="wrapper" style={{ margin: "16px 0" }}>
                        <button type="submit" className="save">
                          Save
                        </button>
                        <button
                          name="desc"
                          onClick={(e) => closeItem(e.target.name)}
                          className="cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : cardDetails.description ? (
                    <>
                      <div
                      className="desc-content"
                      style={{width:'500px', overflow:'hidden' ,}}
                        onClick={() => openItem("desc")}
                        dangerouslySetInnerHTML={{
                          __html: cardDetails.description,
                        }}
                      />
                    </>
                  ) : (
                    <div className="addDesc" onClick={() => openItem("desc")}>
                      Add Your description
                    </div>
                  )}
                </form>
              </div>
              <div
                className="details"
                onClick={() => setshowdetails((prev) => !prev)}
              >
                {showdetails ? "Hide" : "Show"} Details
              </div>
              {showdetails && (
                <div className="details-wrapper">
                  {cardDetails.card_details.map((item, i) => (
                    <div className="wrapper" key={i}>
                      <div className="user-info">
                        {item.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="info">
                        <span className="user-name">{item.user_name}</span>
                        <span>{item.description}</span>
                        <p>{item.created_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="comments">
                {!addItems.comment ? (
                  <input
                    style={{ caretColor: "transparent" }}
                    className="comment add-comment"
                    type="text"
                    placeholder="Write a comment…"
                    data-testid="card-back-new-comment-input-skeleton"
                    aria-placeholder="Write a comment…"
                    aria-label="Write a comment"
                    read-only="true"
                    value="Enter your Comment"
                    name="comment"
                    readOnly
                    onClick={(e) => openItem(e.target.name)}
                  ></input>
                ) : (
                  <form onSubmit={addComment} className="add-comments">
                    <ReactQuill
                      theme="snow"
                      modules={module}
                      ref={newComment}
                      required
                      autoFocus
                      placeholder="Write a comment…"
                    />

                    <div
                      className="wrapper"
                      style={{ flexDirection: "row", margin: "16px 0" }}
                    >
                      <button type="submit" className="save">
                        Save
                      </button>
                      <button
                        name="comment"
                        onClick={(e) => closeItem(e.target.name)}
                        className="cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="wrapper">
                  {cardDetails.comments?.map((comment, i) => (
                    <div key={i}>
                      <Comment
                        comment={comment}
                        user={user}
                        cardId={cardDetails.id}
                        setcardDetails={setcardDetails}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    margin: "25px",
                    color: "#959b99",
                    paddingRight: "24px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {files.map((file) => {
                    if (
                      file.type === "application/pdf" ||
                      file.file_path.includes("pdf")
                    ) {
                      return (
                        <Popup
                          trigger={<div> {file.name || file.file_path} </div>}
                          position="right center"
                        >
                          <Worker
                            workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
                          >
                            <Viewer
                              fileUrl={
                                !file.type
                                  ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                  : file.file_path
                              }
                            />
                          </Worker>
                        </Popup>
                      );
                    } else if (
                      file?.type?.startsWith("image/") ||
                      file.file_path.includes(".jpg") ||
                      file.file_path.includes(".webp") ||
                      file.file_path.includes(".gif") ||
                      file.file_path.includes(".svg")
                    ) {
                      return (
                        <div className="cover-image">
                          <ModalImage
                            small={
                              !file.type
                                ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                : file.file_path
                            }
                            large={
                              !file.type
                                ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                : file.file_path
                            }
                            alt="cover Image"
                          />
                        </div>
                      );
                    } else if (
                      file.file_path.includes(".mp4") ||
                      file.type?.startsWith("video/")
                    ) {
                      return (
                        <div className="cover-image">
                          <video
                            controls
                            src={
                              !file.type
                                ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                : file.file_path
                            }
                            style={{ width: "300px" }}
                          />
                        </div>
                      );
                    } else if (
                      file.file_path.includes(".zip") ||
                      file.type == "application/x-zip-compressed"
                    ) {
                      return (
                        <div>
                          <a
                            href={
                              !file.type
                                ? `https://back.alyoumsa.com/public/storage/${file.file_path}`
                                : file.file_path
                            }
                            download={file.name}
                          >
                            Download {file.name}
                          </a>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            <div className="right">
              <input
                type="file"
                id="uploadCover"
                multiple
                onChange={handleCoverUpload}
                style={{ display: "none" }}
              />
              {files && (
                <div className="item" onClick={handleRemovePhoto}>
                  <img src={deleteCover} alt="Cover" />
                  Remove Attachnent
                </div>
              )}

              <div className="item">
                <label
                  htmlFor="uploadCover"
                  style={{ width: "100%", cursor: "pointer" }}
                >
                  <img src={attach} alt="Cover" />
                  Update Attachment
                </label>
              </div>

              <div className="item date" style={{ padding: "3px" }}>
                <DatePicker
                  showIcon
                  selected=""
                  onChange={(e) => updateDate("start_time", e)}
                  dateFormat="MM/dd/yyyy h:mm aa"
                  icon={CalendarIcon}
                />
                <span>Date</span>
              </div>
              <div className="item" onClick={handleDelete}>
                <img src={deleteimage} alt="Delete" /> Delete
              </div>
              <div className="item cover">
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle
                    className="custom-dropdown-toggle p-0 no-caret"
                    as="button"
                  >
                    <img src={coveru} alt="Delete" /> cover
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ padding: "80px" }}>
                    <Dropdown.Item as="span">
                      <input
                        type="color"
                        className="color"
                        value={cardDetails.color}
                        onChange={updateCoverColor}
                      />
                      <button
                        className="btn btn-info"
                        onClick={(e) => handleChangeColorRequest(e, false)}
                      >
                        Update Cover
                      </button>

                      {cardDetails?.color && (
                        <button
                          className="btn btn-danger"
                          onClick={(e) => updateCoverColor(e, true)}
                        >
                          Delete Cover
                        </button>
                      )}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="item move">
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle
                    className="custom-dropdown-toggle p-0 no-caret"
                    as="button"
                  >
                    <img src={move} alt="Delete" /> Move
                  </Dropdown.Toggle>
                  <Dropdown.Menu drop="start">
                    <Dropdown.Item>
                      <div>
                        <label htmlFor="">List</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setactiveMovinglist(e.target.value)}
                        >
                          {board.lists_of_the_board.map((list) => (
                            <option key={list.id} value={list.id}>
                              {list.title}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div>
                        <label htmlFor="">Position</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setnewPosotion(e.target.value)}
                        >
                          {Array(
                            board.lists_of_the_board.find(
                              (item) => item.id == activeMovinglist
                            ).cards_of_the_list.length + 1
                          )
                            .fill(1)
                            .map((item, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                        </Form.Select>
                      </div>
                    </Dropdown.Item>
                    <Button
                      style={{ width: "60px", margin: "15px" }}
                      variant="primary"
                      size="sm"
                      onClick={() => movingRequest("move")}
                    >
                      Move
                    </Button>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="item move">
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle
                    className="custom-dropdown-toggle p-0 no-caret"
                    as="button"
                  >
                    <img src={copy} alt="copy" /> copy
                  </Dropdown.Toggle>
                  <Dropdown.Menu drop="start">
                    <Dropdown.Item>
                      <div>
                        <label htmlFor="">List</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setactiveMovinglist(e.target.value)}
                        >
                          {board.lists_of_the_board.map((list) => (
                            <option key={list.id} value={list.id}>
                              {list.title}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div>
                        <label htmlFor="">Position</label>
                        <Form.Select
                          size="sm"
                          onChange={(e) => setnewPosotion(e.target.value)}
                        >
                          {Array(
                            board.lists_of_the_board.find(
                              (item) => item.id == activeMovinglist
                            ).cards_of_the_list.length + 1
                          )
                            .fill(1)
                            .map((item, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                        </Form.Select>
                      </div>
                    </Dropdown.Item>
                    <Button
                      style={{ width: "60px", margin: "15px" }}
                      variant="primary"
                      size="sm"
                      onClick={() => movingRequest("copy")}
                    >
                      Copy
                    </Button>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CardDetails;
