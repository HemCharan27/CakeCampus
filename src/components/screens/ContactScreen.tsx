import React from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, MapPin, Clock, MessageSquare, Info, ShieldCheck } from 'lucide-react';

export const ContactScreen: React.FC = () => {
  const { selectedCollege } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1A0A04] via-[#23120B] to-[#2D160D] p-8 sm:p-12 rounded-3xl border border-[#5C2D14]/25 shadow-2xl text-center space-y-4 text-amber-50 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center mx-auto shadow-lg shadow-[#5C2D14]/30 font-black relative z-10">
          <MessageSquare className="w-9 h-9" />
        </div>
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-amber-100">
            Contact <span className="text-brown-gradient">CakeCampus</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/75 max-w-xl mx-auto leading-relaxed">
            Have a question regarding your cake pre-order, customization, or campus pickup schedule? We're here to help!
          </p>
        </div>
      </div>

      {/* Contact Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* On-Campus Pickup Location */}
        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
              <MapPin className="w-5 h-5 text-[#5C2D14]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A0A04] text-base font-serif">On-Campus Pickup Hub</h3>
              <p className="text-xs text-[#7C5542]">{selectedCollege?.name || 'Selected Campus'}</p>
            </div>
          </div>
          <div className="bg-[#F5EDE4] p-4 rounded-2xl border border-[#5C2D14]/15 space-y-1 text-xs text-[#7C5542]">
            <p className="font-bold text-[#1A0A04] text-sm">CakeCampus Point</p>
            <p className="leading-relaxed">
              {selectedCollege?.pickupPoint || 'Central Student Activity Center Hub (Ground Floor)'}
            </p>
          </div>
        </div>

        {/* Operating & Cutoff Hours */}
        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
              <Clock className="w-5 h-5 text-[#5C2D14]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A0A04] text-base font-serif">Order Cutoff & Timings</h3>
              <p className="text-xs text-[#7C5542]">Daily Preparation Schedule</p>
            </div>
          </div>
          <div className="bg-[#F5EDE4] p-4 rounded-2xl border border-[#5C2D14]/15 space-y-1 text-xs text-[#7C5542]">
            <p className="font-bold text-[#1A0A04]">Pre-Order Cutoff: 6:00 PM IST</p>
            <p className="text-[11px] leading-relaxed">
              Place pre-orders before 6 PM for next-day pickup. Counter open for collection 11:00 AM – 6:00 PM daily.
            </p>
          </div>
        </div>

        {/* Support Email */}
        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
              <Mail className="w-5 h-5 text-[#5C2D14]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A0A04] text-base font-serif">Email Support</h3>
              <p className="text-xs font-mono font-bold text-[#5C2D14]">support@cakecampus.in</p>
            </div>
          </div>
          <p className="text-xs text-[#7C5542] leading-relaxed">
            Send us your order inquiries or bulk celebration requests. We typically respond within 2 hours.
          </p>
        </div>

        {/* Helpline Phone */}
        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
              <Phone className="w-5 h-5 text-[#5C2D14]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A0A04] text-base font-serif">Campus Helpline</h3>
              <p className="text-xs font-mono font-bold text-[#5C2D14]">+91 98480 34567</p>
            </div>
          </div>
          <p className="text-xs text-[#7C5542] leading-relaxed">
            Available during pickup counter hours for quick updates on your order collection status.
          </p>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-[#F5EDE4] p-6 rounded-3xl border border-[#5C2D14]/25 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5C2D14]/15 text-[#5C2D14] text-xs font-bold border border-[#5C2D14]/30">
          <Info className="w-4 h-4" />
          <span>Notice</span>
        </div>
        <p className="text-xs text-[#7C5542] max-w-md mx-auto leading-relaxed font-medium">
          Detailed contact info, campus point maps, and dedicated inquiry forms will be updated soon.
        </p>
      </div>
    </div>
  );
};
