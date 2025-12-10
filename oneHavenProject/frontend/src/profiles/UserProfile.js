import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import Header, { NavLink, NavLinks, PrimaryLink, LogoLink } from "components/headers/light.js";
import { FaLightbulb, FaThermometerHalf, FaTv, FaFire, FaPlug, FaWindowMaximize, FaUtensils, FaBath } from "react-icons/fa";
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
const DeviceStateItem = tw.div`mb-2`;
const Message = tw.p`text-center text-gray-600 mt-4`;
const Loading = tw.div`text-center text-primary-500 text-xl font-medium mt-6`;
const DeviceStateContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const PriceContainer = styled.div`
  ${tw`text-lg font-semibold text-right text-gray-900`}
  flex-shrink: 0;
  margin-left: auto;
  align-self: center;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  strong {
    margin-right: 8px;
  }
  label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
  }
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const RoomCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const RoomTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 12px;
  text-align: center;
  color: #374151;
`;

const DeviceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DeviceItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f1f5f9;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #4b5563;

  svg {
    font-size: 1.2rem;
    color: #6b7280;
  }
`;

const deviceIcons = {
  luč: <FaLightbulb />,
  termostat: <FaThermometerHalf />,
  tv: <FaTv />,
  kamin: <FaFire />,
  vtičnica: <FaPlug />,
  žaluzije: <FaWindowMaximize />,
  pečica: <FaUtensils />,
  boiler: <FaBath />,
};

export default function UserProfile() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deviceStates, setDeviceStates] = useState({});
  const [selectedRooms, setSelectedRooms] = useState([]);

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

        data.forEach((reservation) => {
          fetchDeviceStates(reservation._id); // Klic funkcije za pridobitev stanj naprav
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Pridobivanje stanj naprav za določeno rezervacijo
  const fetchDeviceStates = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost:5050/api/naprave/stanja/${reservationId}`
      );

      if (!response.ok) {
        throw new Error(`Napaka pri pridobivanju stanj za rezervacijo ${reservationId}.`);
      }

      const data = await response.json();
      setDeviceStates((prevState) => ({
        ...prevState,
        [reservationId]: data, // Shranimo stanje naprav za določeno rezervacijo
      }));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleRoomSelection = (roomName) => {
    if (selectedRooms.includes(roomName)) {
      setSelectedRooms(selectedRooms.filter((room) => room !== roomName));
    } else {
      setSelectedRooms([...selectedRooms, roomName]);
    }
  };

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

  const formatDate = (dateString) => {
    try {
      const date = new global.Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date.toLocaleDateString("sl-SI", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch (error) {
      console.error("Napaka pri pretvorbi datuma:", error);
      return "N/A";
    }
  };

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
            const devices = deviceStates[reservation._id];

            const filteredRooms =
                selectedRooms.length > 0
                  ? devices?.rooms.filter((room) => selectedRooms.includes(room.name))
                  : devices?.rooms;

            return (
              <ReservationItem key={reservation._id}>
                <div>
                  <Title>Rezervacija ID: {reservation._id}</Title>
                  <Date>
                    Prihod: {formatDate(reservation.checkIn)} - Odhod: {formatDate(reservation.checkOut)}
                  </Date>
                  <Guests>
                    Število odraslih: {reservation.adults}, Število otrok:{" "}
                    {reservation.children}
                  </Guests>
                  {devices?.rooms && devices.rooms.length > 0 && (
  <DeviceStateContainer>
    <FilterSection>
      <strong>Filtriraj prostore:</strong>
      {devices.rooms.map((room) => (
        <label key={room.name}>
          <input
            type="checkbox"
            checked={selectedRooms.includes(room.name)}
            onChange={() => handleRoomSelection(room.name)}
          />
          {room.name}
        </label>
      ))}
    </FilterSection>
    <RoomsGrid>
      {filteredRooms?.map((room) => (
        <RoomCard key={room.name}>
          <RoomTitle>{room.name}</RoomTitle>
          <DeviceList>
            {Object.entries(room.devices).map(([deviceName, attributes]) => (
              <DeviceItem key={deviceName}>
                {deviceIcons[deviceName] || "🔧"}
                <div>
                  <strong>{deviceName}</strong>
                  <ul>
                    {Object.entries(attributes).map(([attr, value]) => (
                      <li key={attr}>
                        {attr}: {typeof value === "boolean" ? (value ? "Vključeno" : "Izključeno") : value}
                      </li>
                    ))}
                  </ul>
                </div>
              </DeviceItem>
            ))}
          </DeviceList>
        </RoomCard>
      ))}
    </RoomsGrid>
  </DeviceStateContainer>
)}
                </div>
                <PriceContainer>Cena: €{reservation.price}</PriceContainer>
              </ReservationItem>
            );
          })}
        </ReservationsContainer>
      )}
    </Content>
  </Container>
);
}