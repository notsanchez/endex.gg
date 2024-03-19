import { Button } from "@nextui-org/react";
import React from "react";

const HomeCategories = () => {
 

  return (
    <div className="w-[100%] lg:w-[60%] flex items-center justify-center py-12 px-12 lg:px-0">
      <div className="flex flex-col items-start justify-center gap-6 w-full">
        <h1 className="text-2xl">Categorias Populares</h1>
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
          <div className="flex flex-col items-center justify-center hover:gap-6 gap-2 w-full cursor-pointer transition-all duration-100">
            <div
              className={`w-full h-60  bg-[url('https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S2_1200x1600-905a96cea329205358868f5871393042')] rounded-lg bg-cover bg-center`}
            ></div>
            <h1 className="font-bold">Roblox</h1>
          </div>
          <div className="flex flex-col items-center justify-center hover:gap-6 gap-2 w-full cursor-pointer transition-all duration-100">
            <div className={`w-full h-60  bg-[url('https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S2_1200x1600-905a96cea329205358868f5871393042')] rounded-lg bg-cover bg-center`}></div>
            <h1 className="font-bold">League of Legends</h1>
          </div>
          <div className="flex flex-col items-center justify-center hover:gap-6 gap-2 w-full cursor-pointer transition-all duration-100">
            <div className={`w-full h-60  bg-[url('https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S2_1200x1600-905a96cea329205358868f5871393042')] rounded-lg bg-cover bg-center`}></div>
            <h1 className="font-bold">Free fire</h1>
          </div>
          <div className="flex flex-col items-center justify-center hover:gap-6 gap-2 w-full cursor-pointer transition-all duration-100">
            <div className={`w-full h-60  bg-[url('https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S2_1200x1600-905a96cea329205358868f5871393042')] rounded-lg bg-cover bg-center`}></div>
            <h1 className="font-bold">Valorant</h1>
          </div>
          <div className="flex flex-col items-center justify-center hover:gap-6 gap-2 w-full cursor-pointer transition-all duration-100">
            <div className={`w-full h-60  bg-[url('https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S2_1200x1600-905a96cea329205358868f5871393042')] rounded-lg bg-cover bg-center`}></div>
            <h1 className="font-bold">Roblox</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCategories;
