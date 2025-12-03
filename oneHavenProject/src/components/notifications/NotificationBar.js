import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";

// Styled components
const NotificationContainer = styled.div`
  ${tw`fixed top-0 left-0 w-full bg-blue-500 text-white px-4 py-2 shadow-lg z-50 flex justify-between items-center`}
  max-height: ${({ show }) => (show ? "100px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  opacity: ${({ show }) => (show ? "1" : "0")};
`;

const NotificationText = styled.div`
  ${tw`text-sm md:text-base`}
`;

const CloseButton = styled.button`
  ${tw`text-white font-bold border-none bg-transparent cursor-pointer`}
`;

const NotificationBar = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event) => {
      console.log("Raw message received from WebSocket:", event.data); // Logiranje
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed message from WebSocket:", data); // Logiranje
        if (data && data.reservationId && data.checkIn && data.checkOut) {
          setNotificationData(data);
          setShowNotification(true);
        } else {
          console.warn("Invalid message format:", data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Samodejno zapiranje obvestila po 5 sekundah
  useEffect(() => {
    let timer;
    if (showNotification) {
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showNotification]);

  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <NotificationContainer show={showNotification}>
      {notificationData && (
        <>
          <NotificationText>
            <strong>Nova rezervacija!</strong> ID: {notificationData.reservationId}, 
            Prihod: {new Date(notificationData.checkIn).toLocaleDateString()}, 
            Odhod: {new Date(notificationData.checkOut).toLocaleDateString()}, 
            Odrasli: {notificationData.adults}, 
            Otroci: {notificationData.children}, 
            Cena: €{notificationData.price}
          </NotificationText>
          <CloseButton onClick={closeNotification}>&times;</CloseButton>
        </>
      )}
    </NotificationContainer>
  );
};

export default NotificationBar;