import React, { useState } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { SectionHeading } from "components/misc/Headings";

const Container = tw.div`relative`;
const Content = tw.div`max-w-screen-xl mx-auto py-16 lg:py-20`;

const Heading = tw(SectionHeading)`text-center`;
const Text = tw.div`mt-4 text-base leading-relaxed text-gray-700 text-center`;

const CardSlider = styled(Slider)`
  ${tw`mt-16`}
  .slick-track {
    ${tw`flex`}
  }
  .slick-slide {
    ${tw`h-auto flex justify-center`}
    display: block !important;
  }
`;


const ImageCard = styled.div`
  ${tw`relative overflow-hidden rounded-lg shadow-lg`};
  width: 280px; /* Zmanjšana širina */
  height: 180px; /* Prilagodljiva višina */
  background-image: url(${({ imageSrc }) => imageSrc});
  background-size: contain; /* Prikaz celotne slike */
  background-position: center; /* Centriranje slike */
  background-repeat: no-repeat; /* Prepreči ponavljanje slike */
  margin: 10px; /* Prostor okoli slike */
`;

export default () => {
  const [sliderRef, setSliderRef] = useState(null);

  const sliderSettings = {
    arrows: false,
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };



  return (
    <Container id="o-nas">
      <Content>
        <Heading>O nas</Heading>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <Text>
              Naša družina je stopila skupaj, da oživimo staro hišo naše prababice,
              ki že več desetletij stoji na robu mirne vasi. Ko smo začeli, smo si
              zastavili poseben cilj: ustvariti prostor, kjer se boste obiskovalci
              lahko potopili v življenje iz preteklosti, a z vsem udobjem sodobnega
              časa. Želimo, da vsak kotiček pripoveduje zgodbo – od starega kamina,
              ob katerem se je nekoč grela družina, do ročno izdelanih detajlov, ki
              ohranjajo duh tradicije.
            </Text>
            <Text>
              A to še ni vse. Dodali smo tudi nekaj modernega pridiha – prostorna
              kuhinja, udobne postelje in kopalnice s pridihom elegance so tu zato,
              da poskrbijo za vaše popolno udobje. Med bivanjem pri nas boste lahko
              uživali v kombinaciji nostalgične topline in sodobnega razvajanja.
              Prepričani smo, da boste ob prebivanju v naši hiši začutili posebno
              povezanost s preteklostjo, a hkrati uživali v vseh malenkostih, ki jih
              ponuja sodobno življenje. Pridite in doživite zgodbo, ki združuje
              staro in novo!
            </Text>
          </div>
          <img
            src="https://nextstagedesign.com/wp-content/uploads/2017/07/remodeling-old-homes-before-and-after-1.png"
            style={{
              width: "20%", // Širina slike
              height: "auto", // Ohrani razmerje slike
              borderRadius: "8px", // Zaokroženi robovi
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Dodana senca
            }}
            alt="Remodeling old home"
          />
        </div>
      </Content>
    </Container>
  );
};