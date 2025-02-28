
import React from 'react';
import HeaderNav from '@/components/ui/HeaderNav';
import { NaturalLanguageInputView } from '@/components/naturalInput/NaturalLanguageInputView';

const NaturalLanguage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderNav 
        view="dashboard"
        setView={() => {}}
        currentMonth="Settembre"
        setActiveModal={() => {}}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <NaturalLanguageInputView />
      </main>
    </div>
  );
};

export default NaturalLanguage;
