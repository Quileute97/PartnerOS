import * as React from 'react';
import { cn } from '../utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, isPositive, icon, className }: StatCardProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {change && (
          <span className={cn('text-xs font-semibold', isPositive ? 'text-emerald-600' : 'text-rose-600')}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
