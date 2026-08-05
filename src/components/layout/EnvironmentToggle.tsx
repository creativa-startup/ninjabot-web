import { createElement } from 'react';
import { useEnvironment } from '../../env/EnvironmentContext';

export const EnvironmentToggle = () => {
  const { environment, toggleEnvironment } = useEnvironment();
  const isSandbox = environment === 'sandbox';

  const trackClass = [
    'w-14 h-7 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer',
    'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    isSandbox
      ? 'bg-amber-400 border-amber-500 focus-visible:ring-amber-400'
      : 'bg-emerald-500 border-emerald-600 focus-visible:ring-emerald-500',
  ].join(' ');

  const thumbClass = isSandbox ? 'translate-x-0' : 'translate-x-7';

  const label = isSandbox ? 'SANDBOX' : 'PROD';
  const labelClass = isSandbox
    ? 'text-amber-600 bg-amber-50'
    : 'text-emerald-600 bg-emerald-50';

  return createElement(
    'div',
    { className: 'fixed right-2 top-1/2 -translate-y-1/2 z-[70] flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-full shadow-lg border border-slate-200 px-2 py-1.5 select-none' },
    createElement(
      'span',
      { className: ['text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded', labelClass].join(' ') },
      label
    ),
    createElement(
      'button',
      {
        type: 'button',
        role: 'switch',
        'aria-checked': isSandbox,
        onClick: toggleEnvironment,
        className: trackClass,
      },
      createElement('span', { className: thumbClass })
    )
  );
};
