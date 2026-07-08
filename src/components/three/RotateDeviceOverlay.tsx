export function RotateDeviceOverlay() {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[999] hidden flex-col items-center justify-center gap-4 bg-[#1a1712] text-[#f5f0e8] portrait:flex">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="animate-[spin_2.2s_ease-in-out_infinite]"
      >
        <rect x="7" y="2" width="10" height="16" rx="2" />
        <path d="M12 20v.01" strokeLinecap="round" />
      </svg>
      <p className="text-sm tracking-wide text-[#d8cdb8]">
        Turn your phone sideways to continue
      </p>
    </div>
  );
}
