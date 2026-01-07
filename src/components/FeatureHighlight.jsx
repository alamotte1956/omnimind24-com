import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from 'lucide-react';

export default function FeatureHighlight({ 
  title, 
  description, 
  position = 'bottom',
  targetElement,
  onComplete 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      setIsVisible(true);
    }
  }, [targetElement]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible || !targetRect) return null;

  const getPosition = () => {
    switch (position) {
      case 'top':
        return { top: targetRect.top - 180, left: targetRect.left };
      case 'bottom':
        return { top: targetRect.bottom + 10, left: targetRect.left };
      case 'left':
        return { top: targetRect.top, left: targetRect.left - 320 };
      case 'right':
        return { top: targetRect.top, left: targetRect.right + 10 };
      default:
        return { top: targetRect.bottom + 10, left: targetRect.left };
    }
  };

  const positionStyle = getPosition();

  return (
    <>
      {/* Spotlight overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          pointerEvents: 'none'
        }}
      />

      {/* Highlight box around target */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-40 pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          border: '3px solid #9333EA',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
        }}
      />

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed z-50 bg-[#1A1A1A] border border-purple-500 rounded-lg shadow-2xl max-w-sm"
        style={{
          top: positionStyle.top,
          left: positionStyle.left
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-4">{description}</p>
          <Button
            onClick={handleDismiss}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Got it
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </>
  );
}