import React, { useState, useEffect } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import BackgroundImage from "images/nature.jpg";
import { Link } from "react-scroll"; 

import Header, { NavLink, NavLinks, PrimaryLink, LogoLink, NavToggle, DesktopNavLinks } from "../headers/light.js";

const StyledHeader = styled(Header)`
  ${tw`pt-8 max-w-none`}
  ${DesktopNavLinks} ${NavLink}, ${LogoLink} {
    ${tw`text-gray-100 hover:border-gray-300 hover:text-gray-300`}
  }
  ${NavToggle}.closed {
    ${tw`text-gray-100 hover:text-primary-500`}
  }
`;

const Container = styled.div`
  ${tw`relative -mx-8 -mt-8 bg-center bg-cover`}
  background-image: url(${BackgroundImage});
`;

const HeroContainer = tw.div`z-20 relative px-4 sm:px-8 max-w-screen-xl mx-auto`;
const TwoColumn = tw.div`pt-24 pb-32 px-4 flex justify-between items-center flex-col lg:flex-row`;
const LeftColumn = tw.div`flex flex-col items-center lg:block`;
const RightColumn = tw.div`w-full sm:w-5/6 lg:w-1/2 mt-16 lg:mt-0 lg:pl-8`;

const Heading = styled.h1`
  ${tw`text-3xl text-center lg:text-left sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-100 leading-none`}
  span {
    ${tw`inline-block mt-2`}
  }
`;

const SlantedBackground = styled.span`
  ${tw`relative text-primary-500 px-4 -mx-4 py-2`}
  &::before {
    content: "";
    ${tw`absolute inset-0 bg-gray-100 transform -skew-x-12 -z-10`}
  }
`;


export default () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Pridobivanje podatkov o uporabniku z uporabo REST API
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5050/api/uporabniki/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user = await response.json();
          setIsLoggedIn(true);
          setIsAdmin(user.isAdmin); // Preverimo, če je uporabnik admin
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Napaka pri pridobivanju podatkov o uporabniku:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    fetchUserData();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="#">O Apartmaju</NavLink>
      <NavLink href="#lokacija" smooth={true} duration={500}>Lokacija</NavLink>
      <NavLink href="#lokacija">Kontakt</NavLink>
      <NavLink href="#o-nas">O Nas</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      {!isLoggedIn && (
        <>
          <NavLink href="/login">Prijava</NavLink>
          <NavLink href="/register">Registracija</NavLink>
        </>
      )}
      {isLoggedIn && (
        <>
          <PrimaryLink href="/reservation">Rezerviraj zdaj</PrimaryLink>
          <NavLink href="/profil">Profil</NavLink>
          <NavLink as="button" onClick={handleLogout}>
            Odjava
          </NavLink>
        </>
      )}
    </NavLinks>,
    <NavLinks key={3}>
      {isAdmin && (
        <>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </>
      )}
    </NavLinks>,
  ];

  return (
    <Container>
      <HeroContainer>
        <StyledHeader links={navLinks} />
        <TwoColumn>
          <Heading>
            <span>Dobrodošli v One Haven</span>
            <br />
            <SlantedBackground>Popoln oddih v središču narave.</SlantedBackground>
          </Heading>
        </TwoColumn>
      </HeroContainer>
    </Container>
  );
};