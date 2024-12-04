import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import Form from "react-bootstrap/Form";
import DateTimeField from '../formatdatetime/DateTimeField';

const PopupMsg = ({ workSpaces, allUsers }) => {
  const currentLoggedUser = JSON.parse(localStorage.getItem("user"));

  console.log(workSpaces, allUsers);
  const [sendtousers, setsendtousers] = useState(null);
  const [deliveredMsg, setDeliveredMsg] = useState([]);

  const [dedicatedMsgInfo, setDedicatedMsgInfo] = useState({
    title: "",
    content: "",
    workspace_id: null,
    user_ids: [],
  });

  const handleUserChange = (user, checked) => {
    if (checked) {
      setDedicatedMsgInfo((prevInfo) => ({
        ...prevInfo,
        user_ids: [...prevInfo.user_ids, user.id],
      }));
    } else {
      setDedicatedMsgInfo((prevInfo) => ({
        ...prevInfo,
        user_ids: prevInfo.user_ids.filter((id) => id !== user.id),
      }));
    }
  };

  const handleSubmit = () => {
    const requestBody = {
      title: dedicatedMsgInfo.title,
      content: dedicatedMsgInfo.content,
      workspace_id: dedicatedMsgInfo.workspace_id,
      user_ids: dedicatedMsgInfo.user_ids,
    };

    if (sendtousers === false) {
      requestBody.workspace_id = dedicatedMsgInfo.workspace_id;
    } else {
      requestBody.user_ids = dedicatedMsgInfo.user_ids;
    }

    axios
      .post("https://back.alyoumsa.com/public/api/messages/send", requestBody, {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user")).token
          }`,
        },
      })
      .then((response) => {
        console.log(response);

        // إعادة تعيين الحقول إلى القيم الأولية
        setDedicatedMsgInfo({
          title: "",
          content: "",
          workspace_id: "",
          user_ids: [],
        });

        // إعادة تعيين الحالة الخاصة بـ sendtousers إلى null إذا أردت
        setsendtousers(null);

        // إذا كان لديك أي عمليات إضافية بعد إرسال الرسالة يمكنك إضافتها هنا
      })
      .catch((error) => console.error(error));
  };

  const getDedicatedMsg = async () => {
    try {
      const response = await axios.get(
        "https://back.alyoumsa.com/public/api/messages/user/messages",
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).token
            }`,
          },
        }
      );

      if (response?.data?.success) {
        console.log(response.data); // إذا كنت تريد الطباعة كاملة
        const messages = response.data.messages;

        console.log("Messages: ", messages); // إذا كنت تحتاج فقط إلى الرسائل

        // فلترة الرسائل الجديدة والتأكد من أنها غير مكررة
        const newMessages = messages.filter(
          (msg) => !deliveredMsg.some((delivered) => delivered.id === msg.id)
        );

        // تحديث deliveredMsg فقط بالرسائل الجديدة غير المكررة
        if (newMessages?.length > 0) {
          setDeliveredMsg((prev) => [...prev, ...newMessages]);
        }
      } else {
        console.error("Failed to fetch messages or invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  // استدعاء الرسائل عند تحميل المكون
  useEffect(() => {
    getDedicatedMsg();
  }, []);
  return (
    <div
      style={{
        width: "300px",
        position: "fixed",
        bottom: "80px",
        right: "30px",
        backgroundColor: "#b6c2cf",
        padding: "20px",
        borderRadius: "10px",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px",
        maxHeight: "440px",
        overflowY: "hidden",
      }}
    >
      {currentLoggedUser.role === "admin" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "5px",
            overflowY: "scroll",
          }}
        >
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              // size="lg"
              type="text"
              placeholder="Enter title"
              value={dedicatedMsgInfo.title}
              onChange={(e) =>
                setDedicatedMsgInfo((prevInfo) => ({
                  ...prevInfo,
                  title: e.target.value,
                }))
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              type="text"
              placeholder="Type your message"
              onChange={(e) =>
                setDedicatedMsgInfo((prevInfo) => ({
                  ...prevInfo,
                  content: e.target.value,
                }))
              }
            />
          </Form.Group>

          <p>want to send to:</p>
          <div
            className="switch"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="secondary"
              className={sendtousers ? "active" : ""}
              onClick={() => {
                setsendtousers(true);

                setDedicatedMsgInfo((prevInfo) => ({
                  ...prevInfo,
                  sendTo: "users",
                }));
              }}
            >
              Users
            </Button>
            <Button
              variant="secondary"
              className={sendtousers ? "" : "active"}
              onClick={() => {
                setsendtousers(false);
                setDedicatedMsgInfo((prevInfo) => ({
                  ...prevInfo,
                  sendTo: "workspace",
                }));
              }}
            >
              Workspace
            </Button>
          </div>

          {sendtousers !== null &&
            (sendtousers ? (
              <Form.Group
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "2px",
                  flexWrap: "wrap",
                }}
              >
                <Form.Label>choose Dedicated Users</Form.Label>
                {allUsers &&
                  allUsers.map((user) => (
                    <Form.Check
                      key={user.id}
                      type="checkbox"
                      id={user.id}
                      label={user.name}
                      value={user.id}
                      checked={dedicatedMsgInfo.user_ids.includes(user.id)}
                      onChange={(e) => handleUserChange(user, e.target.checked)}
                      style={{
                        width: "45%",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#1c2b41",
                      }}
                    />
                  ))}
              </Form.Group>
            ) : (
              <Form.Group>
                <Form.Select
                  value={dedicatedMsgInfo.workspace_id}
                  onChange={(e) =>
                    setDedicatedMsgInfo((prevInfo) => ({
                      ...prevInfo,
                      workspace_id: e.target.value,
                    }))
                  }
                  aria-label="Select workspace"
                >
                  <option value="" disabled>
                    Select a workspace
                  </option>
                  {workSpaces &&
                    workSpaces.map((ws) => (
                      <option value={ws.id} key={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            ))}

          <Button
            variant="danger"
            type="submit"
            onClick={handleSubmit}
            style={{
              marginTop: "10px",
            }}
          >
            {" "}
            send
          </Button>
        </div>
      ) : (
        <>
          <button
            onClick={getDedicatedMsg}
            style={{
              backgroundColor: "#1c2b41",
              padding: "4px 10px",
              borderRadius: "30px",
              color: "#b6c2cf",
            }}
          >
            check for msg
          </button>

          {deliveredMsg.length > 0 ? (
            <div
              style={{
                overflowY: "scroll",
                width: "99%",
              }}
            >
              {deliveredMsg.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    backgroundColor: "#ddd",
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                >
                  <h5>{msg.title}</h5>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#1c2b41",
                      marginTop: "5px",
                      overflowY: "auto", // لإظهار شريط التمرير عند الحاجة بشكل طولي
                      overflowX: "hidden", // إخفاء الشريط العرضي
                      height: "auto", // لزيادة الارتفاع بناءً على المحتوى
                      width: "100%",
                      wordWrap: "break-word", // يسمح بتقسيم الكلمات الطويلة إلى سطور جديدة
                      whiteSpace: "normal", // يتأكد من أن النص يمكن أن يتكسر في السطر
                    }}
                  >
                    {msg.content}
                  </p>
                  {/* <DateTimeField data={msg.created_at} /> */}
                </div>
              ))}
            </div>
          ) : (
            <p>You have no message</p>
          )}
        </>
      )}
    </div>
  );
};

export default PopupMsg
