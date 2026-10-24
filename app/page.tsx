import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { HowItWorks } from "@/components/home/HowItWorks";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { Team } from "@/components/home/Team";
import { JoinCta } from "@/components/home/JoinCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <HowItWorks />
      <UpcomingEvents />
      <Team />
      <JoinCta />
    </>
  );
}
