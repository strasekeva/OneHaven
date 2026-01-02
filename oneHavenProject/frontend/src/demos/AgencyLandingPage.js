import React, { useEffect, useState } from "react";
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
import { API_URL } from "api";

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
        const response = await fetch(`${API_URL}/api/uporabniki/me`, {
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
      {/* O apartmaju */}
      <section id="apartma">
        <Hero />
        {isAdmin && <NotificationBar />}
      </section>

      {/* Galerija, če jo želiš vezati na O apartmaju, jo lahko pustiš tu */}
      <PhotoGallery />

      {/* Lokacija */}
      <section id="lokacija">
        <MapComponent />
      </section>

      {/* O nas */}
      <section id="o-nas">
        <AboutUs />
      </section>
      <EnergyChart />
      <ScrapingComponent />
      <Footer />
    </AnimationRevealPage>
  );
};