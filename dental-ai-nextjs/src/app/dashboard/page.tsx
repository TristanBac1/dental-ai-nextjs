import Navbar from "@/components/Navbar";
import React from "react";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import MainActions from "@/components/dashboard/MainActions";
import ActivityOverview from "@/components/dashboard/ActivityOverview";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className='max-w-7xl mx-auto px-6 py-8 pt-24'>
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
      </div>
    </div>
  );
};

export default Dashboard;
