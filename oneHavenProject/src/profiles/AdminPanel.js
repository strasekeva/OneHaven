import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";

const Container = tw.div`min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center pt-10 px-4`;
const Heading = tw.h1`text-3xl font-bold text-center mb-8`;
const ReservationsContainer = tw.div`w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`;
const ReservationCard = styled.div`
  ${tw`bg-white shadow-lg rounded-lg p-6 border border-gray-200`}
`;
const Title = tw.h2`text-lg font-semibold text-blue-800 mb-2`;
const Date = tw.p`text-gray-600 text-sm mb-2`;
const Guests = tw.p`text-gray-700 text-sm mb-4`;
const Info = tw.div`text-gray-800 text-sm`;
const InfoTitle = tw.p`font-bold mb-1`;
const Divider = tw.div`my-4 border-t border-gray-300`;

const PriceContainer = styled.div`
  ${tw`text-lg font-semibold text-center text-gray-900`}
  flex-shrink: 0;
  margin-left: auto;
  align-self: center;
`;

const HomeButton = styled.a`
  ${tw`inline-block px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-800 mt-6`}
  text-decoration: none;
`;

export default function AdminPanel() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          "http://localhost:5050/api/admin/rezervacije",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Napaka pri nalaganju rezervacij.");
        }

        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new global.Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date.toLocaleDateString("sl-SI", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Napaka pri pretvorbi datuma:", error);
      return "N/A";
    }
  };

  return (
    <Container>
      <Heading>Admin Panel - Vse Rezervacije</Heading>
      <HomeButton href="/">← Na Domačo Stran</HomeButton>
      <br />
      {loading && <p>Nalaganje rezervacij...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && reservations.length === 0 && (
        <p>Trenutno ni rezervacij.</p>
      )}
      {!loading && !error && reservations.length > 0 && (
        <ReservationsContainer>
          {reservations.map((reservation) => (
            <ReservationCard key={reservation._id}>
              <Title>Rezervacija ID: {reservation._id}</Title>
              <Date>
                <strong>Prihod:</strong> {formatDate(reservation.checkIn)} <br />
                <strong>Odhod:</strong> {formatDate(reservation.checkOut)}
              </Date>
              <Guests>
                <strong>Število odraslih:</strong> {reservation.adults} <br />
                <strong>Število otrok:</strong> {reservation.children}
              </Guests>
              <Divider />
              <Info>
                <InfoTitle>Uporabnik</InfoTitle>
                <p>
                  <strong>Ime in Priimek:</strong> {reservation.userId.ime}{" "}
                  {reservation.userId.priimek}
                </p>
                <p>
                  <strong>E-pošta:</strong> {reservation.userId.email}
                </p>
              </Info>
              <Divider />
              <PriceContainer>Cena: €{reservation.price}</PriceContainer>
            </ReservationCard>
          ))}
        </ReservationsContainer>
      )}
      <HomeButton href="/">← Na Domačo Stran</HomeButton>
    </Container>
  );
}