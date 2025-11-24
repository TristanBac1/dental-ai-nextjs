import { auth } from "@clerk/nextjs/server";
import React from "react";
import ProPlanRequired from "@/components/voice/ProPlanRequired";
import Navbar from "@/components/Navbar";
import WelcomeSection from "@/components/voice/WelcomeSection";
import FeatureCards from "@/components/voice/FeatureCards";
import VapiWidget from "@/components/voice/VapiWidget";

const VoicePage = async () => {
  const { has } = await auth();

  const hasProPlan = has({ plan: "ai_basic" }) || has({ plan: "ai_pro" });
  console.log("User has Pro Plan:", hasProPlan);

  if (!hasProPlan) return <ProPlanRequired />;

  return (
    <div className='bg-background min-h-screen'>
      <Navbar />
      <div className='max-w-7xl mx-auto px-6 py-8 pt-24'>
        <WelcomeSection />
        <FeatureCards />
      </div>

      <VapiWidget />
    </div>
  );
};

export default VoicePage;
