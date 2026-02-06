import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";

export const LandscapeOverlay = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Only show on mobile-sized devices in portrait
      const isMobileDevice = window.innerWidth < 1024 || window.innerHeight < 600;
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobileDevice && isPortraitMode);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/98 flex flex-col items-center justify-center gap-6 p-8">
      <RotateCw className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: '3s' }} />
      <p className="text-foreground text-xl font-bold text-center font-digital tracking-wide">
        Por favor, gire o dispositivo para o modo paisagem para uma melhor experiência
      </p>
    </div>
  );
};
