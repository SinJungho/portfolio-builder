import Features from "@/components/home/Features";
import FinalCTA from "@/components/home/FinalCTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import RecruiterPreview from "@/components/home/RecruiterPreview";
import SocialProof from "@/components/home/SocialProof";

export default function Page() {
  return (
    <div className="min-h-[100dvh] bg-spotify-near-black">
      <Hero />
      <SocialProof />
      <HowItWorks />
      <RecruiterPreview />
      <Features />
      <FinalCTA />
    </div>
  );
}
