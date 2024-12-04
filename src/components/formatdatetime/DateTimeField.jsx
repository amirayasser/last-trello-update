import React from "react";

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);

  // استخراج مكونات التاريخ
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // الأشهر تبدأ من 0
  const day = String(date.getDate()).padStart(2, "0");

  // استخراج مكونات الوقت
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // تحويل الساعة لنظام 12 ساعة
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // إذا كانت الساعة 0، تظهر كـ 12.

  // التنسيق النهائي
  return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

const DateTimeField = (date) => {

  return (
      <small style={{
        // color:'#ccc',

      }}>{formatDateTime(date)}</small>
  );
};

export default DateTimeField;
