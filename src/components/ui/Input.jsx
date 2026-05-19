import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  helperText,
  className = '', 
  id,
  ...props 
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm placeholder-slate-400
          focus:outline-none focus:ring-2 focus:border-blue-500 transition-colors
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
