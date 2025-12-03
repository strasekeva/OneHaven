import React, { useEffect, useState } from "react";
import tw from "twin.macro"; //eslint-disable-line
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";

import Hero from "components/hero/BackgroundAsImage.js";
import MainFeature from "components/features/ThreeColWithSideImage";
import AboutUs from "components/cards/ThreeColSlider.js";
import Footer from "components/footers/MiniCenteredFooter.js";
import EnergyChart from "OPSI/EnergyChart";
import ScrapingComponent from "scraping/ScrapingComponent";
import NotificationBar from "components/notifications/NotificationBar";
import PhotoGallery from "components/notifications/PhotoGallery";
import MapComponent from "components/notifications/MapComponent";

//const AdminNotification = tw.div`bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md mb-6`;

export default () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
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
          setIsAdmin(user.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Napaka pri pridobivanju podatkov o uporabniku:", error);
        setIsAdmin(false);
      }
    };

    fetchUserData();
  }, []);


  return (
    <AnimationRevealPage>
      <Hero />
      {/* Prikaz obvestila samo za admina */}
      {isAdmin && <NotificationBar />}
      <PhotoGallery />
      <MainFeature />
      <MapComponent />
      <AboutUs />
      <EnergyChart />
      <ScrapingComponent />
      <Footer />
    </AnimationRevealPage>
  );
};