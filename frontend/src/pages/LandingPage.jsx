import React, { useState } from 'react';
import Navbar from '../components/landing/Navbar';
import PrepriaHero from '../components/landing/PrepriaHero';
import FeatureStrip from '../components/landing/FeatureStrip';
import WhatPrepriaDoes from '../components/landing/WhatPrepriaDoes';
import BuiltForStudents from '../components/landing/BuiltForStudents';
import PlatformModules from '../components/landing/PlatformModules';
import CollegeSection from '../components/landing/CollegeSection';
import CollegePartnerModal from '../components/landing/CollegePartnerModal';
import DifferentiationSection from '../components/landing/DifferentiationSection';
import FinalCTA from '../components/landing/FinalCTA';
import PrepriaFooter from '../components/landing/PrepriaFooter';

export default function LandingPage() {
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  const handleOpenPartnerModal = () => {
    setPartnerModalOpen(true);
  };

  const handleClosePartnerModal = () => {
    setPartnerModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-[#111111] dark:text-white font-manrope selection:bg-[#FF6B00] selection:text-white relative">
      
      {/* Navigation Header */}
      <Navbar onOpenPartnerModal={handleOpenPartnerModal} />

      {/* Main Landing Flow */}
      <main>
        {/* Visually Striking Hero with Live Dashboard Preview */}
        <PrepriaHero />

        {/* Horizontal 5-Feature Strip */}
        <FeatureStrip />

        {/* What PREPRIA Does - 7-Step Interactive Journey */}
        <WhatPrepriaDoes />

        {/* Built For Students Section */}
        <BuiltForStudents />

        {/* One Platform, Complete Career Preparation */}
        <PlatformModules />

        {/* Campus Placement & College Section */}
        <CollegeSection onOpenPartnerModal={handleOpenPartnerModal} />

        {/* Differentiation / Why PREPRIA */}
        <DifferentiationSection />

        {/* Final Orange High-Impact CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <PrepriaFooter onOpenPartnerModal={handleOpenPartnerModal} />

      {/* Partner With PREPRIA Modal */}
      <CollegePartnerModal 
        isOpen={partnerModalOpen} 
        onClose={handleClosePartnerModal} 
      />

    </div>
  );
}
