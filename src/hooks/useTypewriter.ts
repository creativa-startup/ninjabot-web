import { useEffect, useState } from 'react';

/**
 * Hook Typewriter — efecto máquina de escribir para los textos de la IA.
 *
 * - Muestra `text` carácter por carácter a una velocidad configurable.
 * - Se reinicia automáticamente cuando `text` cambia.
 * - Retorna el texto parcial y si aún está escribiendo (para mostrar cursor).
 */
export function useTypewriter(text: string, speed: number = 28): { displayedText: string; isTyping: boolean } {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');

    let charIndex = 0;
    const intervalId = window.setInterval(() => {
      charIndex += 1;
      setDisplayedText(text.slice(0, charIndex));

      if (charIndex >= text.length) {
        window.clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [text, speed]);

  return { displayedText, isTyping };
}