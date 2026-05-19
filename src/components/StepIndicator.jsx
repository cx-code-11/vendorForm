import React from 'react';
import { Check } from 'lucide-react';

export function StepIndicator({ steps, currentStep }) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <li key={step.name} className="md:flex-1">
              <div className={`
                group flex flex-col border-l-4 md:border-l-0 md:border-t-4 py-2 pl-4 md:pl-0 md:pt-4 md:pb-0
                ${isCompleted ? 'border-blue-600' : isCurrent ? 'border-blue-600' : 'border-slate-200'}
              `}>
                <span className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                  Step {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  {step.name}
                  {isCompleted && <Check className="w-4 h-4 text-blue-600" />}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
