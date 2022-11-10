import classNames from "classnames/bind";
import styles from "./Chat.module.scss";
import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { AiOutlineSend, AiFillLike } from "react-icons/ai";
import { FaSmile } from "react-icons/fa";
import axios from "axios";

const host = "http://localhost:8080";

const cx = classNames.bind(styles);

function Chat() {
  const [mess, setMess] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState("");

  const socketRef = useRef();
  const messagesEnd = useRef();

  const sender = "a496064f-a53b-4fc8-8e06-e6049a39d04c";
  const receiver = "bed7eccc-66f7-4d86-99d4-98a80082ab85";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE0OTYwNjRmLWE1M2ItNGZjOC04ZTA2LWU2MDQ5YTM5ZDA0YyIsInVzZXJuYW1lIjoidGFuaG5lIiwiaWF0IjoxNjY4MDYyMDUxLCJleHAiOjE2Njg2NjY4NTF9.Nu8N90whqgQQBRb_-raRaTqWhwI7Me6jczrb6xtTIvw";

  useEffect(() => {
    socketRef.current = socketIOClient.connect(host);
    axios
      .create()
      .post(`${host}/chat/conversation`, { friendId: receiver }, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setConversationId(res.data.id);
        socketRef.current.emit("joinRoom", conversationId);
      });

    axios
      .create()
      .get(`${host}/chat/conversation/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        console.log(res.data);
        setMess(res.data);
      });
    socketRef.current.on("receiveMessage", (dataGot) => {
      setMess((oldMsgs) => [...oldMsgs, dataGot]);
      scrollToBottom();
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (message !== null) {
      const msg = {
        content: message,
        sender: sender,
        status: "sending",
      };
      socketRef.current.emit("sendMessage", conversationId, msg);
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    messagesEnd.current.scrollIntoView({ behavior: "smooth" });
  };

  const renderMess = mess.map((m, index) => (
    <div key={index} className={cx(m.sender === sender ? "your-message" : "other-people")}>
      {m.content}
    </div>
  ));

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const onEnterPress = (e) => {
    // eslint-disable-next-line
    if (e.keyCode == 13 && e.shiftKey == false) {
      sendMessage();
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("box-chat")}>
        <div className={cx("box-chat_message")}>
          {renderMess}
          <div style={{ float: "left", clear: "both" }} ref={messagesEnd}></div>
        </div>

        <div className={cx("send-box")}>
          <div className={cx("send-message-box")}>
            <input className={cx("text-area")} value={message} onKeyDown={onEnterPress} onChange={handleChange} placeholder="Aa" />
            <div className={cx("feeling-btn")}>
              <FaSmile />
            </div>
          </div>
          <button className={cx("button-send")} onClick={sendMessage}>
            {message.length > 0 ? <AiOutlineSend /> : <AiFillLike />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
