import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import Header, { NavLink, NavLinks, PrimaryLink, LogoLink } from "components/headers/light.js";
import AdminPanel from "./AdminPanel";

const Container = tw.div`min-h-screen bg-gray-100 flex flex-col`;
const Content = tw.div`flex-grow flex flex-col items-center pt-16 px-6 sm:px-16`;
const FullWidthSection = tw.div`w-full flex flex-col items-center`;
const Heading = tw.h1`text-4xl font-bold text-center mb-12 text-primary-700`;
const ReservationsContainer = tw.div`w-full max-w-4xl bg-white shadow-lg rounded-lg p-8`;
const ReservationItem = styled.div`
  ${tw`flex flex-col md:flex-row justify-between items-center p-4 border-b`}
  &:last-child {
    ${tw`border-b-0`}
  }
`;
const Title = tw.h2`text-lg font-semibold text-primary-700`;
const Date = tw.p`text-gray-600 text-sm`;
const Guests = tw.p`text-sm text-gray-600`;
const Status = tw.p`text-sm text-gray-800 font-medium`;
const Message = tw.p`text-center text-gray-600 mt-4`;
const Loading = tw.div`text-center text-primary-500 text-xl font-medium mt-6`;

export default function UserProfile() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pridobivanje rezervacij
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Niste prijavljeni.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5050/api/rezervacije", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

  // Navigacijski meni
  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="/">Domov</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      <NavLink as="button" onClick={() => localStorage.removeItem("authToken")}>
        Odjava
      </NavLink>
      <PrimaryLink href="/reservation">Rezerviraj zdaj</PrimaryLink>
    </NavLinks>,
  ];

  return (
  <Container>
    <Header links={navLinks} />
    <Content>
      <Heading>Moj Profil</Heading>
      {loading && <Loading>Nalaganje rezervacij...</Loading>}
      {error && <Message>{error}</Message>}
      {!loading && !error && reservations.length === 0 && (
        <Message>Trenutno nimate nobene pretekle rezervacije.</Message>
      )}
      {!loading && !error && reservations.length > 0 && (
        <ReservationsContainer>
          {reservations.map((reservation) => {
            let checkInDate = null;
            let checkOutDate = null;

            try {
              // Poskusimo pretvoriti datume, pri čemer uporabimo globalni objekt Date
              checkInDate = new window.Date(reservation.checkIn);
              checkOutDate = new window.Date(reservation.checkOut);

              if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new Error("Neveljaven datum");
              }
            } catch (error) {
              console.error(
                `Napaka pri pretvorbi datuma za rezervacijo ${reservation._id}:`,
                error
              );
              checkInDate = null;
              checkOutDate = null;
            }

            return (
              <ReservationItem key={reservation._id}>
                <div>
                  <Title>Rezervacija ID: {reservation._id}</Title>
                  <Date>
                    Prihod:{" "}
                    {checkInDate
                      ? checkInDate.toLocaleDateString()
                      : "N/A"} - Odhod:{" "}
                    {checkOutDate
                      ? checkOutDate.toLocaleDateString()
                      : "N/A"}
                  </Date>
                  <Guests>
                    Število odraslih: {reservation.adults}, Število otrok:{" "}
                    {reservation.children}
                  </Guests>
                </div>
                <Status>Cena: €{reservation.price}</Status>
              </ReservationItem>
            );
          })}
        </ReservationsContainer>
      )}
    </Content>
  </Container>
);
}