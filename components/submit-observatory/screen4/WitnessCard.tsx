'use client';

import { User, Mail, Clock, CheckCircle, X } from 'lucide-react';

interface Witness {
  type: 'user' | 'email';
  userId?: string;
  username?: string;
  email?: string;
  status: 'pending' | 'confirmed' | 'declined';
}

interface WitnessCardProps {
  witness: Witness;
  onRemove: () => void;
}

export function WitnessCard({ witness, onRemove }: WitnessCardProps) {
  const getStatusBadge = () => {
    switch (witness.status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1 text-xs text-success-soft">
            <CheckCircle className="w-3 h-3" />
            <span>Bestätigt</span>
          </div>
        );
      case 'declined':
        return (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <X className="w-3 h-3" />
            <span>Abgelehnt</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Clock className="w-3 h-3" />
            <span>Ausstehend</span>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-space-deep/60 border border-glass-border rounded-lg hover:border-observatory-gold/30 transition-all group">
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-observatory-gold/10 border border-observatory-gold/30 rounded-full">
        {witness.type === 'user' ? (
          <User className="w-5 h-5 text-observatory-gold" />
        ) : (
          <Mail className="w-5 h-5 text-observatory-gold" />
        )}
      </div>

      {/* Witness Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {witness.type === 'user' ? witness.username : witness.email}
        </div>
        {getStatusBadge()}
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-2 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
        aria-label="Remove witness"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
