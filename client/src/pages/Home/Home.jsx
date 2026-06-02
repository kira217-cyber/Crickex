import React from "react";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import Categories from "../../components/Categories/Categories";
import Favourites from "../../components/Favourites/Favourites";
import PopularGames from "../../components/PopularGames/PopularGames";
import Footer from "../../components/Footer/Footer";

const Home = () => {
  return (
    <div>
      <Slider />
      <Notice />
      <Categories />
      <Favourites />
      <PopularGames />  
      <Footer />
    </div>
  );
};

export default Home;
