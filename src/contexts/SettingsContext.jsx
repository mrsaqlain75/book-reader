import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

const fontOptions = [
  { id: 'original', name: 'Original', class: 'font-original' },
  { id: 'quiet',    name: 'Quiet',    class: 'font-quiet'    },
  { id: 'paper',    name: 'Paper',    class: 'font-paper'    },
  { id: 'bold',     name: 'Bold',     class: 'font-bold'     },
  { id: 'calm',     name: 'Calm',     class: 'font-calm'     },
  { id: 'focus',    name: 'Focus',    class: 'font-focus'    },
];

// Background colours — light → warm → coloured → dark
const bgColors = [
  { id: 'white',  name: 'White',      class: 'bg-white'       },
  { id: 'ivory',  name: 'Ivory',      class: 'bg-[#fffff0]'   },
  { id: 'sepia',  name: 'Sepia',      class: 'bg-[#f4ecd8]'   },
  { id: 'warm',   name: 'Warm',       class: 'bg-[#fdf6ec]'   },
  { id: 'blue',   name: 'Soft Blue',  class: 'bg-[#e8f0f8]'   },
  { id: 'green',  name: 'Soft Green', class: 'bg-[#e8f4e8]'   },
  { id: 'gray',   name: 'Light Gray', class: 'bg-[#f5f5f0]'   },
  { id: 'dark',   name: 'Dark',       class: 'bg-[#1a1a1a]'   },
  { id: 'night',  name: 'Night',      class: 'bg-[#0a0a0a]'   },
];

// Text colours — from deep to light
const textColors = [
  { id: 'dark',   name: 'Dark',        class: 'text-[#1a1a1a]' },
  { id: 'soft',   name: 'Soft Gray',   class: 'text-[#4a4a4a]' },
  { id: 'warm',   name: 'Warm Brown',  class: 'text-[#3d3522]' },
  { id: 'blue',   name: 'Deep Blue',   class: 'text-[#2c3e50]' },
  { id: 'green',  name: 'Forest',      class: 'text-[#2d4a2d]' },
  { id: 'purple', name: 'Deep Purple', class: 'text-[#4a2d4a]' },
  { id: 'light',  name: 'Light',       class: 'text-[#e0e0e0]' },
  { id: 'white',  name: 'White',       class: 'text-white'     },
];

export function SettingsProvider({ children }) {
  const [font,      setFont]      = useLocalStorage('reading_font',  fontOptions[0]);
  const [fontSize,  setFontSize]  = useLocalStorage('font_size',     1.1);
  const [bgColor,   setBgColor]   = useLocalStorage('bg_color',      bgColors[0]);   // White default
  const [textColor, setTextColor] = useLocalStorage('text_color',    textColors[0]); // Dark default

  return (
    <SettingsContext.Provider value={{
      font, setFont, fontOptions,
      fontSize, setFontSize,
      bgColor, setBgColor, bgColors,
      textColor, setTextColor, textColors,
      // viewMode is intentionally omitted — the app is page-view only
    }}>
      {children}
    </SettingsContext.Provider>
  );
}