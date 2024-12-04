import React, { useState, useEffect } from "react";
import "./card.css";
import CardDetails from "../CardDetails/CardDetails";
import api from "../../apiAuth/auth";

import Cookies from "js-cookie";
import { MdOutlineEdit } from "react-icons/md";

const Card = React.memo(({ card, onCardDelete, listId, board, setShow }) => {

  const [open, setOpen] = useState(false); // حالة المودال

  const [selectedFile, setSelectedFile] = useState([]);

  const cookies = Cookies.get("token");

  const onOpenModal = () => {
    setOpen(true);
    setShow(false);
  };
  const onCloseModal = () => setOpen(false);

  const handleDeleteCard = (id) => {
    onCardDelete(id);
    onCloseModal();
  };

  const [cardDetails, setcardDetails] = useState({});
  // console.log(cardDetails);
  useEffect(() => {
    const fetchcarddetails = async () => {
      try {
        const { data } = await api({
          url: `cards/get-card/${card.id}`,
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setcardDetails(data.data);
        setSelectedFile(data.files);
      } catch (err) {
        console.log(err);
      }
    };
    fetchcarddetails();
  }, [card.card_id]);

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (newText) => {
    setcardDetails((prev) => ({
      ...prev,
      text: newText,
    }));
  };

  // حفظ النص عند انتهاء التعديل
  const saveEdit = () => {
    setIsEditing(false);
    // عند حفظ التعديل، يمكنك إضافة طلب API لحفظ التغيير إذا كان مطلوبًا
    console.log("Updated text:", cardDetails.text);
  };

  // التعامل مع الحدث عند الضغط على الأيقونة
  const handleEditClick = (e) => {
    e.stopPropagation(); // منع الحدث من الانتشار
    setIsEditing(true); // تفعيل وضع التعديل
  };

  // التعامل مع الحدث عند الضغط على الحقل
  const handleInputClick = (e) => {
    e.stopPropagation(); // منع الحدث من الانتشار عند الضغط على الحقل
  };

  return (
    <>
      <div className="item" onClick={onOpenModal}>
        {cardDetails?.color && (
          <div
            className="cover-image"
            style={{
              backgroundColor: cardDetails.color,
            }}
          ></div>
        )}
        <div className="card-text">
          {isEditing ? (
            <input
              type="text"
              value={cardDetails.text}
              onChange={(e) => handleEdit(e.target.value)} // تحديث القيمة عند التعديل
              onBlur={saveEdit} // حفظ التعديل عند فقدان التركيز
              onClick={handleInputClick} // إضافة stopPropagation هنا
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveEdit(); // حفظ التعديل عند الضغط على Enter
                }
              }}
              autoFocus
            />
          ) : (
            <p>{cardDetails.text}</p>
          )}
          {/* أيقونة التعديل */}
          <MdOutlineEdit onClick={handleEditClick} />
        </div>
      </div>
      <CardDetails
        onCloseModal={onCloseModal}
        listId={listId}
        open={open}
        cardDetails={cardDetails}
        setcardDetails={setcardDetails}
        onDeleteCard={handleDeleteCard}
        board={board}
        files={selectedFile}
        setSelectedFile={setSelectedFile}
      />
    </>
  )
});

// Set displayName for debugging purposes
Card.displayName = "CardComponent";

export default Card;
