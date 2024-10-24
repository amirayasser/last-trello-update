import React, { useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import ReactQuill from "react-quill";
import Cookies from "js-cookie";
import api from "../../apiAuth/auth";

function Comment({ comment, user, cardId, setcardDetails }) {
  const [editComment, seteditComment] = useState(false);
  const [updatedComment, setupdatedComment] = useState(comment.comment);
  const toolbarOptions = [
    ["bold", "italic"],
    ["link", "image"],
  ];

  const cookies = Cookies.get("token");

  const module = {
    toolbar: toolbarOptions,
  };

  const editCommentRequest = async (id) => {
    if (updatedComment == "<p><br></p>") {
      return;
    }
    try {
      const response = await api({
        url: `/comments/update`,
        method: "POST",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          comment_id: comment.comment_id.toString(),
          card_id: cardId,
          comment: updatedComment,
        },
      });
      setcardDetails((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) => {
          if (comment.comment_id == id) {
            return {
              ...comment,
              comment: updatedComment,
            };
          } else {
            return comment;
          }
        }),
      }));
      seteditComment(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteCommentRequest = async (id) => {
    if (confirm("Are you sure you want to proceed?")) {
      try {
        const response = await api({
          url: `/comments/destroy/${id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setcardDetails((prev) => ({
          ...prev,
          comments: prev.comments.filter(
            (comment) => comment.comment_id !== id
          ),
        }));
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (!editComment) {
    return (
      <div>
        <div className="comment-item">
          <Dropdown>
            <Dropdown.Toggle
              className="custom-dropdown-toggle p-0 no-caret"
              as="button"
            >
              <div className="user-info">
                {user.name.split(" ")[0].charAt(0).toUpperCase()}
                {"."}
                {user.name.split(" ")[1]?.charAt(0)?.toUpperCase()}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <div className="top">
                  <div className="wrapper">
                    <div className="user-info">
                      {user.name.split(" ")[0].charAt(0).toUpperCase()}
                      {"."}
                      {user.name.split(" ")[1]?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="info">
                      <div className="email">{user.name}</div>
                      <div className="email">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="bottom"></div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <div
            className="comment"
            style={{ color: "white" }}
            dangerouslySetInnerHTML={{
              __html: comment.comment,
            }}
          />
        </div>
        <div className="control">
          <span onClick={() => seteditComment(true)}>Edit</span>
          <span onClick={(e) => deleteCommentRequest(comment.comment_id)}>
            Delete
          </span>
        </div>{" "}
      </div>
    );
  } else {
    return (
      <>
        <ReactQuill
          theme="snow"
          modules={module}
          value={updatedComment}
          onChange={(e) => setupdatedComment(e)}
        />
        <div
          className="wrapper"
          style={{ margin: "16px 0", flexDirection: "row" }}
        >
          <button
            type="submit"
            className="save"
            onClick={(e) => editCommentRequest(comment.comment_id)}
          >
            Save
          </button>
          <button
            name="desc"
            onClick={() => seteditComment(false)}
            className="cancel"
          >
            Cancel
          </button>
        </div>
      </>
    );
  }
}

export default Comment;
