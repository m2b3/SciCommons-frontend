import { ToggleSwitch } from 'flowbite-react';
import { useState } from 'react';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
  );
};

export default DarkModeToggle;
