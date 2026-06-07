import React from 'react';
import { Heart } from 'lucide-react';

const EmptyState = ({ icon: Icon = Heart, title, subtitle }) => (
  <div className="text-center py-16 px-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blush-100 text-blush-500 mb-4 animate-float">
      <Icon size={36} />
    </div>
    <h3 className="serif text-2xl font-semibold text-rose-deep mb-2">{title}</h3>
    {subtitle && <p className="text-mauve-500 max-w-md mx-auto">{subtitle}</p>}
  </div>
);

export default EmptyState;
