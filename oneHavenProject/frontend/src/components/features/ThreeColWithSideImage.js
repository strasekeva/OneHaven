import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
//eslint-disable-next-line
import { css } from "styled-components/macro";
import { SectionHeading, Subheading as SubheadingBase } from "components/misc/Headings.js";
import { SectionDescription } from "components/misc/Typography.js";

import { MdAcUnit, MdOutlineMap,MdOutlineHome, MdBuild, MdSupervisedUserCircle, MdElectricCar, MdCheckCircle } from "react-icons/md";

import { ReactComponent as SvgDecoratorBlob3 } from "images/svg-decorator-blob-3.svg";

const Container = tw.div`relative`;

const ThreeColumnContainer = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center max-w-screen-lg mx-auto py-20 md:py-24`}
`;
const Subheading = tw(SubheadingBase)`mb-4`;
const Heading = tw(SectionHeading)`w-full`;
const Description = tw(SectionDescription)`w-full text-center`;

const VerticalSpacer = tw.div`mt-10 w-full`;

const Column = styled.div`
  ${tw`md:w-1/2 lg:w-1/3 max-w-sm`}
`;

const Card = styled.div`
  ${tw`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left h-full mx-4 px-2 py-8`}
  .iconContainer {
    ${tw`border text-center rounded-full p-5 flex-shrink-0`}
    svg {
      ${tw`w-8 h-8 text-primary-500`}
    }
  }

  .textContainer {
    ${tw`sm:ml-4 mt-4 sm:mt-2`}
  }

  .title {
    ${tw`mt-4 tracking-wide font-bold text-2xl leading-none`}
  }

  .description {
    ${tw`mt-1 sm:mt-4 font-medium text-secondary-100 leading-loose`}
  }
`;

const DecoratorBlob = styled(SvgDecoratorBlob3)`
  ${tw`pointer-events-none absolute right-0 bottom-0 w-64 opacity-25 transform translate-x-32 translate-y-48 `}
`;

export default ({ cards = null, heading = "Kaj ponujamo" }) => {
  /*
   * This component has an array of objects denoting the cards defined below. Each object in the cards array has the following keys:
   *  1) icon - React component for the icon to display
   *  2) title - the title of the card
   *  3) description - the description of the card
   *  If a key for a particular card is not provided, a default value is used.
   */

  const defaultCards = [
    {
      icon: MdOutlineHome,
      title: "Prostorne sobe",
      description: "Uživajte v udobnih, svetlih in prostorno zasnovanih sobah, ki ponujajo popolno udobje za sprostitev."
    },
    {
      icon: MdOutlineMap,
      title: "Lokacija v bližini vsega",
      description: "Naša nastanitev se nahaja blizu plaže, trgovin in lokalnih znamenitosti – vse na dosegu roke."
    },
    {
      icon: MdBuild,
      title: "Popolnoma opremljeno",
      description: "Apartma vključuje vse sodobne pripomočke, od popolnoma opremljene kuhinje do brezplačnega Wi-Fi-ja."
    },
    {
      icon: MdAcUnit,
      title: "Klimatiziran prostor",
      description: "Ostajajte prijetno ohlajeni v vročih dneh in se sprostite v prijetni notranjosti."
    },
    {
      icon: MdSupervisedUserCircle,
      title: " Idealno za družine",
      description: "Naša nastanitev je popolna izbira za družine – dovolj prostora za vse in otrokom prijazno okolje."
    },
    {
      icon: MdElectricCar,
      title: "Brezplačno parkirišče",
      description: "Poskrbeli smo za udobno in varno parkirišče za vaše vozilo med bivanjem pri nas."
    }
  ];

  if (!cards) cards = defaultCards;

  return (
    <Container>
      <ThreeColumnContainer>
        <Heading>{heading}</Heading>
        <VerticalSpacer />
        {cards.map((card, i) => (
          <Column key={i}>
            <Card>
              <span className="iconContainer">
                <card.icon /> {/* Uporabljamo ikono kot komponento */}
              </span>
              <span className="textContainer">
                <span className="title">{card.title || "Default Title"}</span>
                <p className="description">
                  {card.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                </p>
              </span>
            </Card>
          </Column>
        ))}
      </ThreeColumnContainer>
      <DecoratorBlob />
    </Container>
  );
};