import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from './ui/utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "••••••••",
  className = "",
  disabled = false,
  leftIcon
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10">
          {leftIcon}
        </div>
      )}
      
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          leftIcon ? "pl-10" : "pl-3",
          "pr-12", // Make room for the eye icon
          className
        )}
        disabled={disabled}
      />
      
      <motion.button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        className={cn(
          "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)] focus:ring-opacity-50 rounded-sm",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        whileHover={disabled ? {} : { scale: 1.1 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <AnimatePresence mode="wait">
          {showPassword ? (
            <motion.div
              key="eye-off"
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <EyeOff className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="eye"
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Eye className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Password strength indicator (optional visual enhancement) */}
      {value && !disabled && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: value.length > 0 ? `${Math.min((value.length / 12) * 100, 100)}%` : 0,
            opacity: showPassword ? 0.8 : 0.4
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      )}
    </div>
  );
};