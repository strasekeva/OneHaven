import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";

const Container = tw.div`min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center pt-10`;
const Heading = tw.h1`text-3xl font-bold text-center mb-6`;
const ReservationsContainer = tw.div`w-full max-w-4xl bg-white shadow-md rounded-lg p-6`;
const ReservationItem = styled.div`
  ${tw`flex justify-between items-center p-4 border-b`}
  &:last-child {
    ${tw`border-b-0`}
  }
`;
const Title = tw.h2`text-xl font-semibold`;
const Date = tw.p`text-gray-600 text-sm`;
const Message = tw.p`text-center text-gray-600 mt-4`;

export default function AdminPanel() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Pridobimo JWT token
        const response = await fetch("http://localhost:5050/api/admin/rezervacije", {
          headers: {
            Authorization: `Bearer ${token}`, // Pošljemo token v glavi zahteve
          },
        });

        if (!response.ok) {
          throw new Error("Napaka pri nalaganju rezervacij.");
        }

        const data = await response.json();
        setReservations(data); // Nastavimo podatke o rezervacijah
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return (
    <Container>
      <Heading>Admin Panel - Vse Rezervacije</Heading>
      {loading && <Message>Nalaganje rezervacij...</Message>}
      {error && <Message>{error}</Message>}
      {!loading && !error && reservations.length === 0 && (
        <Message>Trenutno ni rezervacij.</Message>
      )}
      {!loading && !error && reservations.length > 0 && (
        <ReservationsContainer>
          {reservations.map((reservation) => (
            <ReservationItem key={reservation._id}>
              <div>
                <Title>{reservation.apartmentName}</Title>
                <Date>Datum: {new Date(reservation.date).toLocaleDateString()}</Date>
              </div>
              <div>
                <p><strong>Uporabnik ID:</strong> {reservation.userId}</p>
                <p><strong>Status:</strong> {reservation.status}</p>
              </div>
            </ReservationItem>
          ))}
        </ReservationsContainer>
      )}
    </Container>
  );
}