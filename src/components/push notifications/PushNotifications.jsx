import React, { useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Alert } from "react-bootstrap";
import { AuthContext } from "../context/Auth";

const Notifications = ({ workspaceId ,userid }) => {

    const {user} = useContext(AuthContext)


  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    console.log(userid)
    // تأكد من وجود user.id أو workspaceId
    if (!workspaceId  || !userid ) {
      console.error("workspaceId or user.id is required!");
      return;
    }

    // Initialize Pusher
    const pusher = new Pusher("9e95435ba2e76113d739", {
      cluster: "eu",
      forceTLS: true, // Use HTTPS
    });

    // Subscribe to workspace or user channel
    const workspaceChannel = workspaceId
      ? pusher.subscribe(`workspace.${workspaceId}`)
      : null;
    const userChannel = userid ? pusher.subscribe(`user.${userid}`) : null;

    // Handle workspace messages
    if (workspaceChannel) {
      workspaceChannel.bind("message.sent", (data) => {
        console.log("Received workspace message:", data);
        setNotifications((prev) => [
          ...prev,
          { source: "workspace", message: data.message },
        ]);
      });
    }
    // Handle user messages
    if (userChannel) {
      userChannel.bind("message.sent", (data) => {
        console.log("Received user message:", data);
        setNotifications((prev) => [
          ...prev,
          { source: "user", message: data.message },
        ]);
      });
    }

    // Track connection errors
    pusher.connection.bind("error", (err) => {
      console.error("Pusher connection error:", err);
    });

    // Clean up subscriptions when component unmounts
     return () => {
       if (workspaceChannel) pusher.unsubscribe(`workspace.${workspaceId}`);
       if (userChannel) pusher.unsubscribe(`user.${userid}`);
     };

  }, [workspaceId, userid]);

  console.log("notifications", notifications);



  
    // <div
    //   style={{
    //     position: "fixed",
    //     top: "60px",
    //     left: "0px",
    //     width: "100%",
    //     // backgroundColor: "rgba(255,255,255,0.8)",
    //     padding: "5px 40px 0",
    //     minHeight: "50px",
    //     zIndex: "100",
    //   }}
    // >
    return (
       notifications.map((notif, index) => ( 
        <Alert
        key={index}
        variant="primary"
        onClose={() => setShow(false)}
        dismissible
        style={{
          position: "fixed",
          top: "66px",
          left: "3%",
          width: "94%",
          zIndex: "100",

        }}
      >
        <Alert.Heading>
          {notif.message.title}
        </Alert.Heading>
        <p
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            maxWidth: "100%",
            fontSize: "14px",
            lineHeight: "1.5",

            color: "#333",
            textOverflow: "ellipsis",
            overflow: "hidden",
            textDecoration: "none",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.3s ease",
            padding: "2px 15px",
            borderRadius: "3px",
          }}
        >
          {notif.message.content}
        </p>
      </Alert>
       ))
    );
    // </div>
};

export default Notifications;
