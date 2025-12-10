import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { SectionHeading, Subheading as SubheadingBase } from "components/misc/Headings.js";
import kitchenImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/kitchen.webp";
import diningImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/dining_room.jpg";
import livingRoomImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/living_room.png";
import bedroomImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/bedroom.jpg";
import bathroomImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/bathroom.avif";
import kidsImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/kids.webp";
import houseImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/image.png";
import laundryImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/laundry.jpeg";
import viewImage from "/Users/evastrasek/Documents/RIRS/Projekt/OneHaven/oneHavenProject/frontend/src/images/view.jpg";
import { PrimaryButton } from "components/misc/Buttons";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
`;

const Heading = tw(SectionHeading)`w-full`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1); /* Povečanje slike ob hoverju */
  }
`;

const images = [
    houseImage,
    viewImage,
    livingRoomImage,
    kitchenImage,
    diningImage,
    bedroomImage,
    kidsImage,
    bathroomImage,
];

const PhotoGalleryWithDescription = () => {
  return (
    <Container>
      <Heading>Dobrodošli v našem apartmaju!</Heading>
      <Description>
        Odkrijte popoln oddih v našem apartmaju, kjer se udobje sreča z razkošjem.
        Uživajte v čudovitih razgledih, sodobno opremljenih prostorih in lokaciji,
        ki je blizu vsega, kar potrebujete za nepozabne počitnice. Rezervirajte
        zdaj in ustvarite spomine, ki bodo trajali večno!
      </Description>
      <GalleryContainer>
        {images.map((src, index) => (
          <ImageContainer key={index}>
            <Image src={src} />
          </ImageContainer>
        ))}
      </GalleryContainer>
      <br />
      <PrimaryButton href="/reservation">Rezerviraj zdaj!</PrimaryButton>
    </Container>
  );
};

export default PhotoGalleryWithDescription;