import React from "react";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { SectionHeading } from "components/misc/Headings.js";

// Pravilna pot za slike markerja
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";

// Nastavitev privzetega markerja
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Glavni stil sekcije
const SectionWrapper = styled.section`
  margin: 40px 0;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

// Postavitev zemljevida in besedila
const ContentWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
`;

// Zemljevid na levi
const MapWrapper = styled.div`
  flex: 1;
  min-width: 400px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

// Opis na desni
const TextWrapper = styled.div`
  flex: 1;
  min-width: 300px;
  text-align: left;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AddressTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  font-weight: bold;
`;

const SectionText = styled.p`
  font-size: 1.0rem;
  line-height: 1.5;
  color: #555;
`;

const ContactInfo = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  color: #555;

  span {
    font-weight: bold;
    color: #333;
  }
`;

const StyledButton = styled.a`
  display: inline-block;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const MapSection = () => {
  // Koordinate za Trnovec 49
  const position = [46.04181, 15.37719]; // Latitude, Longitude za Trnovec 49

  return (
    <SectionWrapper id="lokacija">
      {/* Naslov na vrhu */}
      <SectionHeading>Naša Lokacija in Kontakt</SectionHeading>

      {/* Zemljevid in besedilo */}
      <ContentWrapper>
        <MapWrapper>
          <MapContainer
            center={position}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <b>Trnovec 49, Sevnica</b> <br /> Tukaj se nahaja naš apartma.
              </Popup>
            </Marker>
          </MapContainer>
        </MapWrapper>

        <TextWrapper>
        <AddressTitle>Kontakt</AddressTitle>
          <ContactInfo>
            <SectionText>
              Janez Novak
            </SectionText>
            <SectionText>
              <span>Telefon:</span> +386 41 123 456
            </SectionText>
          </ContactInfo>
          <AddressTitle>Naslov</AddressTitle>
          <SectionText>
            Trnovec 49, 8292 Zabukovje nad Sevnico, Slovenija
          </SectionText>
          <StyledButton
            href="https://www.google.com/maps/dir/?api=1&destination=46.04181,15.37719"
            target="_blank"
            rel="noopener noreferrer"
          >
            Poglej na Google Maps
          </StyledButton>
        </TextWrapper>
      </ContentWrapper>
    </SectionWrapper>
  );
};

export default MapSection;