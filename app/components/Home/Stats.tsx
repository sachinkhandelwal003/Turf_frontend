"use client";

// Screenshot ke according data update kar diya
const statsData = [
  { value: '500+', label: 'GROUNDS' },
  { value: '50k+', label: 'PLAYERS' },
  { value: '12+', label: 'CITIES' },
  { value: '495+', label: 'BOOKING' },
];

export default function Stats() {
  return (
    // Padding badha di taaki figma jaisa khulla-khulla (airy) feel aaye
    <section className="bg-white py-16">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* divide-x hata diya kyunki figma mein lines nahi hain */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1.5">
              {/* Numbers: Bade, Bold aur exact Green color */}
              <span className="text-4xl md:text-[42px] font-bold text-[#1abc60] leading-none">
                {stat.value}
              </span>
              {/* Labels: Dark grey, Bold, Uppercase aur figma jaisi letter spacing (tracking-widest) */}
              <span className="text-[12px] md:text-[14px] font-bold text-gray-700 uppercase tracking-[0.15em]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}