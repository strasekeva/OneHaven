import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import { SectionHeading, Subheading as SubheadingBase } from "components/misc/Headings.js";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Container = tw.div`relative`;
const TwoColumn = tw.div`flex flex-col md:flex-row justify-between max-w-screen-xl mx-auto py-20 md:py-24`;
const Column = tw.div`w-full max-w-md mx-auto md:max-w-none md:mx-0`;
const ImageColumn = styled(Column)`
  ${tw`md:w-5/12 flex-shrink-0 h-80 md:h-auto`}
  display: flex;
  align-items: center;
  justify-content: center;
`;
const TextColumn = styled(Column)(props => [
  tw`md:w-7/12 mt-16 md:mt-0`,
  props.textOnLeft ? tw`md:mr-12 lg:mr-16 md:order-first` : tw`md:ml-12 lg:ml-16 md:order-last`
]);

const CalendarWrapper = styled.div`
  ${tw`p-4 bg-white rounded-lg shadow-lg`}
  .react-calendar {
    ${tw`border-0`}
  }
  .react-calendar__tile--range {
    ${tw`bg-gray-400`} // Stil za datume znotraj obsega
  }
  .react-calendar__tile--disabled {
    ${tw`bg-gray-200 cursor-not-allowed`} /* Stil za zasedene datume */
  }
  .react-calendar__tile--rangeStart,
  .react-calendar__tile--rangeEnd {
    ${tw`bg-blue-500 text-white`} // Stil za začetni in končni datum
  }
`;

const TextContent = tw.div`lg:py-8 text-center md:text-left`;
const Subheading = tw(SubheadingBase)`text-center md:text-left`;
const Heading = tw(SectionHeading)`mt-4 font-black text-left text-3xl sm:text-4xl lg:text-5xl text-center md:text-left leading-tight`;
const Description = tw.p`mt-4 text-center md:text-left text-sm md:text-base lg:text-lg font-medium leading-relaxed text-secondary-100`;

const Form = tw.form`mt-8 md:mt-10 text-sm flex flex-col max-w-sm mx-auto md:mx-0`;
const Label = tw.label`mt-4 text-sm font-semibold text-gray-600`;
const Input = tw.input`border-b-2 py-2 focus:outline-none font-medium transition duration-300 hocus:border-primary-500`;
const SubmitButton = tw(PrimaryButtonBase)`inline-block mt-8`;

export default ({
  subheading = "Rezervacija apartmaja",
  heading = <>Rezervirajte <span tw="text-primary-500">svoj oddih</span></>,
  description = "Izberite datum vašega prihoda in odhoda, vnesite število odraslih in otrok ter oddajte rezervacijo.",
  submitButtonText = "Rezerviraj zdaj",
  formMethod = "post",
  textOnLeft = true,
}) => {
  const [dates, setDates] = useState([new Date(), new Date()]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Pridobivanje zasedenih datumov iz REST API-ja
  useEffect(() => {
    const fetchOccupiedDates = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/rezervacije/zasedeni-datumi");
        if (!response.ok) throw new Error("Napaka pri nalaganju zasedenih datumov.");
        const data = await response.json();
        const formattedDates = data.map((date) => new Date(date)); // Pretvorimo datume v objekte Date
        setOccupiedDates(formattedDates);
      } catch (err) {
        console.error("Napaka:", err);
      }
    };

    fetchOccupiedDates();
  }, []);

  const handleReservation = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Morate biti prijavljeni za rezervacijo.");
      return;
    }

    const reservationData = {
      checkIn: dates[0],
      checkOut: dates[1],
      adults,
      children,
    };

    try {
      const response = await fetch("http://localhost:5050/api/rezervacije", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Dodamo JWT za avtentikacijo
        },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Rezervacija uspešna! Cena: €" + data.reservation.price);
        setDates([new Date(), new Date()]);
        setAdults(1);
        setChildren(0);
        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Napaka pri oddaji rezervacije.");
      }
    } catch (err) {
      setError("Napaka pri povezovanju s strežnikom.");
    }
  };

  // Onemogočanje zasedenih datumov na koledarju
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      return occupiedDates.some(
        (occupiedDate) =>
          date.getFullYear() === occupiedDate.getFullYear() &&
          date.getMonth() === occupiedDate.getMonth() &&
          date.getDate() === occupiedDate.getDate()
      );
    }
    return false;
  };

  return (
    <Container>
      <TwoColumn>
        <TextColumn textOnLeft={textOnLeft}>
          <TextContent>
            {subheading && <Subheading>{subheading}</Subheading>}
            <Heading>{heading}</Heading>
            {description && <Description>{description}</Description>}
            <Form onSubmit={handleReservation} method={formMethod}>
              <Label htmlFor="adults">Število odraslih:</Label>
              <Input
                type="number"
                id="adults"
                min="1"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
              <Label htmlFor="children">Število otrok:</Label>
              <Input
                type="number"
                id="children"
                min="0"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
              <SubmitButton type="submit">{submitButtonText}</SubmitButton>
            </Form>
          </TextContent>
        </TextColumn>
        <ImageColumn>
          <CalendarWrapper>
            <Calendar
              onChange={setDates}
              selectRange={true}
              value={dates}
              tileDisabled={tileDisabled} // Onemogočanje datumov
            />
          </CalendarWrapper>
        </ImageColumn>
      </TwoColumn>
    </Container>
  );
};