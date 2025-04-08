import React from "react";
import { Code, GitBranch } from "lucide-react";

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  redirect?: string;
  redirectTime?: number;
}

const Loading = ({
  fullScreen = false,
  text = "Loading",
  redirect,
  redirectTime = 2000,
}: LoadingProps) => {
  const [dots, setDots] = React.useState("");
  const [redirectCounter, setRedirectCounter] = React.useState(
    redirectTime / 1000
  );
  const [showIcon, setShowIcon] = React.useState(true);

  React.useEffect(() => {
    // Animated dots effect
    const dotInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 400);

    // Icon toggle animation
    const iconInterval = setInterval(() => {
      setShowIcon((prev) => !prev);
    }, 1500);

    return () => {
      clearInterval(dotInterval);
      clearInterval(iconInterval);
    };
  }, []);

  // Handle redirect if specified
  React.useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        window.location.href = redirect;
      }, redirectTime);

      // Countdown timer
      const countInterval = setInterval(() => {
        setRedirectCounter((prev) => prev - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countInterval);
      };
    }
  }, [redirect, redirectTime]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 bg-[#1f2125] ${
        fullScreen ? "fixed inset-0 z-50" : "p-10 rounded-lg"
      }`}
    >
      <div className="relative w-16 h-16">
        {/* Code editor inspired spinner with branch animation */}
        <div className="absolute inset-0 rounded-full bg-[#1bf07c]/20 animate-ping"></div>

        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1bf07c] animate-spin"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          {showIcon ? (
            <Code size={20} className="text-[#1bf07c]" />
          ) : (
            <GitBranch size={20} className="text-[#1bf07c]" />
          )}
        </div>

        <div className="absolute inset-0 rounded-full bg-[rgba(255,255,255,0.05)] blur-sm"></div>
      </div>

      <div className="text-white flex flex-col items-center">
        <div className="text-lg font-mono flex items-center">
          <span>{text}</span>
          <span className="w-5 text-left font-mono">{dots}</span>
        </div>

        {redirect && (
          <p className="text-sm text-[#1bf07c] mt-2 font-mono">
            Redirecting in {redirectCounter}s
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
