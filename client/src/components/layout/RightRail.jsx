import React from 'react';
import { HelpCircle, Github, Sliders, Terminal } from 'lucide-react';

export const RightRail = () => {
  return (
    <aside className="hidden xl:flex w-[56px] bg-surface border-l border-line flex-col items-center select-none z-30">
      {/* Top Icon Cell */}
      <div className="w-[56px] h-[56px] border-b border-line flex items-center justify-center text-ink hover:bg-bg cursor-pointer transition-colors duration-100">
        <Terminal size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
      </div>

      {/* Middle Stprogressbar / Action Cells */}
      <div className="flex flex-col items-center w-full">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="w-[56px] h-[56px] border-b border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-bg transition-colors duration-100"
          title="GitHub Repository"
        >
          <Github size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </a>

        <button
          type="button"
          className="w-[56px] h-[56px] border-b border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-bg transition-colors duration-100"
          title="System Settings"
        >
          <Sliders size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </button>

        <button
          type="button"
          className="w-[56px] h-[56px] border-b border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-bg transition-colors duration-100"
          title="Documentation & Guide"
        >
          <HelpCircle size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </button>
      </div>

      {/* Vertical Rail Text */}
      <div className="mt-auto pb-8 flex items-center justify-center">
        <span
          className="text-[10px] uppercase font-mono tracking-widest text-ink-muted whitespace-nowrap"
          style={{ writingMode: 'vertical-rl' }}
        >
          GRID REF // 0x56
        </span>
      </div>
    </aside>
  );
};
