type SwitchProps = {
  checked: boolean;
  onChange: () => void;
};

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`
        inline-flex h-6 w-11 items-center rounded-full border p-1
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25
        ${
          checked
            ? "justify-end border-[#2be675] bg-[#0b7f3b]"
            : "justify-start border-[#ff4d4f] bg-[#a01515]"
        }
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 rounded-full bg-[#e9ecef] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_6px_rgba(0,0,0,0.35)]
        `}
      />
    </button>
  );
}
