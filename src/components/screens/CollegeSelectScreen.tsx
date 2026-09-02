import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CollegeItem } from '../../types';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  LogOut,
  Sparkles,
  ShieldCheck,
  Cake
} from 'lucide-react';

export const CollegeSelectScreen: React.FC = () => {
  const { 
    colleges, 
    isLoadingColleges, 
    selectedCollege, 
    selectCollege, 
    customerUser, 
    logoutCustomer,
    setCurrentScreen 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(selectedCollege?.id || selectedCollege?._id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredColleges = colleges.filter(college => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      college.name.toLowerCase().includes(q) ||
      college.code.toLowerCase().includes(q) ||
      (college.location && college.location.toLowerCase().includes(q)) ||
      (college.pickupPoint && college.pickupPoint.toLowerCase().includes(q))
    );
  });

  const handleSelectAndProceed = async (college: CollegeItem) => {
    setSelectedId(college.id || college._id || college.name);
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await selectCollege(college);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentScreen('home');
    } else {
      setErrorMessage(res.error || 'Failed to select college. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDE4] text-[#1C0D08] flex flex-col font-sans selection:bg-[#5C2D14]/15 selection:text-[#1A0A04]">
      {/* Top Header Bar */}
      <header className="bg-[#1C0D08] border-b border-[#3D1E14] sticky top-0 z-30 shadow-md text-amber-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center shadow-md font-black">
              <Cake className="w-5 h-5 text-[#1A0A04]" />
            </div>
            <div>
              <span className="font-serif font-black text-base text-amber-100 block leading-tight">
                Cake<span className="text-[#5C2D14]">Campus</span>
              </span>
              <span className="text-[10px] text-amber-300/70 font-medium">Order today, celebrate tomorrow</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {customerUser && (
              <span className="text-xs text-amber-200/80 hidden sm:inline">
                Hi, <strong className="text-amber-100">{customerUser.name}</strong>
              </span>
            )}
            <button
              onClick={() => logoutCustomer()}
              className="p-2 rounded-xl text-amber-300 hover:text-red-400 hover:bg-[#2D160D] border border-amber-900/40 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Banner Card */}
        <div className="bg-[#FFF8EE] p-6 sm:p-8 rounded-3xl border border-[#5C2D14]/20 shadow-sm text-center space-y-3 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#23120B] text-[#7C5542] border border-[#5C2D14]/30 flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-[#23120B] text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#5C2D14]/30">
              <Sparkles className="w-3 h-3 text-[#7C5542]" />
              <span>Step 2: Choose Campus</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C0D08] font-serif pt-1">
              Select Your College Campus
            </h1>
            <p className="text-xs sm:text-sm text-[#7C5542] max-w-md mx-auto">
              Choose your campus location to browse freshly baked cakes available for on-campus pickup point delivery.
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search college name, code, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:bg-[#FFF8EE] focus:outline-hidden text-xs text-[#1C0D08] shadow-2xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* College Grid List */}
        {isLoadingColleges ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-[#7C5542]">Loading campus list...</p>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="bg-[#FFF8EE] p-8 rounded-3xl border border-[#5C2D14]/20 text-center space-y-3">
            <Building2 className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">No colleges matched your search</p>
            <p className="text-xs text-stone-400">Try searching for a different keyword or acronym</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredColleges.map((college) => {
              const id = college.id || college._id || college.name;
              const isSelected = selectedId === id || selectedCollege?.name === college.name;

              return (
                <div
                  key={id}
                  onClick={() => handleSelectAndProceed(college)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left relative overflow-hidden group hover:shadow-md ${
                    isSelected 
                      ? 'bg-amber-50/70 border-[#5C2D14] ring-2 ring-amber-500/20 shadow-xs' 
                      : 'bg-[#FFF8EE] border-[#5C2D14]/20 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-[#23120B] text-amber-300 border border-amber-900/30 uppercase">
                          {college.code}
                        </span>
                        {college.location && (
                          <span className="text-[11px] text-[#7C5542] flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {college.location}
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-stone-300 group-hover:border-[#5C2D14] flex items-center justify-center transition-colors">
                          <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-[#5C2D14]" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#1C0D08] group-hover:text-[#5C2D14] transition-colors">
                      {college.name}
                    </h3>

                    <div className="bg-[#F5EDE4] p-2.5 rounded-xl border border-[#5C2D14]/20 text-[11px] text-[#7C5542] flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Pickup at: <strong className="text-stone-800">{college.pickupPoint}</strong></span>
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#5C2D14] text-[#1A0A04] font-black shadow-xs'
                        : 'bg-stone-100 group-hover:bg-[#5C2D14] text-stone-700 group-hover:text-[#1A0A04] group-hover:font-black'
                    }`}
                  >
                    {isSubmitting && isSelected ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Select &amp; Browse Cakes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

