import React, { useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { SectionHeading } from "components/misc/Headings.js";

// Styled components
const Container = tw.div`relative bg-gray-100 py-20`;
const HeadingContainer = styled.div`
  ${tw`text-center mb-10`}
`;
const Heading = tw(SectionHeading)`w-full`;
const Description = tw.p`text-lg text-gray-700`;

const ListContainer = styled.div`
  ${tw`max-w-screen-xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}
`;

const Card = styled.div`
  ${tw`bg-white rounded-lg shadow-md p-6 flex flex-col cursor-pointer transition-transform transform hover:scale-105`}
`;

const Image = styled.img`
  ${tw`w-full h-48 object-cover rounded-lg mb-4`}
`;

const InfoContainer = tw.div`flex-1`;
const Title = tw.h3`text-lg font-semibold text-gray-800 mb-2`;
const Location = tw.p`text-gray-600 text-sm mb-1`;
const Contact = tw.p`text-gray-600 text-sm`;

const Button = tw.button`px-6 py-2 bg-primary-500 text-white rounded-lg mt-6 hover:bg-primary-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed`;

// Main component
const ScrapingComponent = () => {
  const [gostilne, setGostilne] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);

  const fetchGostilne = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5050/api/gostilne");
      if (!response.ok) throw new Error("Napaka pri nalaganju podatkov.");

      const data = await response.json();
      setGostilne(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerScraping = async () => {
    setScraping(true);
    setError(null);

    try {
        // Pošljemo POST zahtevo na API za sprožitev scraping procesa
        const response = await fetch("http://localhost:5050/api/gostilne/scrape", {
            method: "POST", // Nastavimo metodo na POST
            headers: {
                "Content-Type": "application/json", // Določimo, da je vsebina JSON (če pošiljamo podatke)
            },
        });

        if (!response.ok) throw new Error("Napaka pri sprožitvi scraping procesa.");

        // Osvežimo podatke po končanem scraping-u
        await fetchGostilne();
    } catch (err) {
        setError(err.message);
    } finally {
        setScraping(false);
    }
};

  const handleCardClick = (url) => {
    window.open(url, "_blank"); // Odpre povezavo v novem zavihku
  };

  return (
    <Container>
      <HeadingContainer>
        <Heading>Gostilne in restavracije</Heading>
        <Description>Pridobite informacije o restavracijah in gostilnah v kraju.</Description>
      </HeadingContainer>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ListContainer>
          {gostilne.map((gostilna, index) => (
            <Card key={index} onClick={() => handleCardClick(gostilna.url)}>
              <Image src={gostilna.imageUrl || "/placeholder-image.jpg"} alt={gostilna.name} />
              <InfoContainer>
                <Title>{gostilna.name}</Title>
                <Location>
                  <strong>Lokacija:</strong> {gostilna.location}
                </Location>
                <Contact>
                  <strong>Kontakt:</strong> {gostilna.contact}
                </Contact>
              </InfoContainer>
            </Card>
          ))}
        </ListContainer>
      )}

      <div tw="flex justify-center space-x-4">
        <Button onClick={fetchGostilne} disabled={loading || scraping}>
          {loading ? "Nalagam..." : "Osveži podatke"}
        </Button>
        <Button onClick={triggerScraping} disabled={scraping || loading}>
          {scraping ? "Scraping poteka..." : "Sproži scraping"}
        </Button>
      </div>
    </Container>
  );
};

export default ScrapingComponent;