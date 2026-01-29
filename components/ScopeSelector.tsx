"use client";

import React from "react";
import { VisibilityLevel, UserScopes } from "@/types/search";
import { Lock, Users, Building, Globe } from "lucide-react";

interface ScopeSelectorProps {
  selected: VisibilityLevel[];
  onChange: (scopes: VisibilityLevel[]) => void;
  userScopes: UserScopes | null;
  disabled?: boolean;
}

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({
  selected,
  onChange,
  userScopes,
  disabled = false,
}) => {
  const toggleScope = (scope: VisibilityLevel) => {
    if (disabled) return;

    if (selected.includes(scope)) {
      onChange(selected.filter((s) => s !== scope));
    } else {
      onChange([...selected, scope]);
    }
  };

  const getScopeLabel = (scope: VisibilityLevel): string => {
    switch (scope) {
      case VisibilityLevel.PRIVATE:
        return "My Files";
      case VisibilityLevel.DEPARTMENT:
        return userScopes?.department
          ? `${userScopes.department} Team`
          : "Department";
      case VisibilityLevel.ORGANIZATION:
        return userScopes?.organization
          ? `${userScopes.organization} Org`
          : "Organization";
      case VisibilityLevel.PUBLIC:
        return "Public";
      default:
        return scope;
    }
  };

  const getScopeIcon = (scope: VisibilityLevel) => {
    switch (scope) {
      case VisibilityLevel.PRIVATE:
        return <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case VisibilityLevel.DEPARTMENT:
        return <Users className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case VisibilityLevel.ORGANIZATION:
        return <Building className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case VisibilityLevel.PUBLIC:
        return <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />;
      default:
        return null;
    }
  };

  const isAvailable = (scope: VisibilityLevel): boolean => {
    switch (scope) {
      case VisibilityLevel.PRIVATE:
        return true; // Always available
      case VisibilityLevel.DEPARTMENT:
        return !!userScopes?.department;
      case VisibilityLevel.ORGANIZATION:
        return !!userScopes?.organization;
      case VisibilityLevel.PUBLIC:
        return true; // Always available
      default:
        return false;
    }
  };

  const availableScopes = [
    VisibilityLevel.PRIVATE,
    VisibilityLevel.DEPARTMENT,
    VisibilityLevel.ORGANIZATION,
    VisibilityLevel.PUBLIC,
  ].filter(isAvailable);

  return (
    <div className="flex flex-col gap-3 px-6 py-4 border border-vault-border bg-vault-surface rounded">
      <label className="text-[10px] uppercase tracking-widest font-bold text-vault-text-secondary">
        Search in
      </label>

      <div className="flex flex-wrap gap-2">
        {availableScopes.map((scope) => (
          <button
            key={scope}
            onClick={() => toggleScope(scope)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] uppercase tracking-widest font-bold
              transition-all duration-300
              ${
                selected.includes(scope)
                  ? "border-vault-accent bg-vault-accent/10 text-vault-accent"
                  : "border-vault-border bg-vault-bg text-vault-text-secondary hover:border-vault-accent"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {getScopeIcon(scope)}
            {getScopeLabel(scope)}
          </button>
        ))}
      </div>

      {availableScopes.length === 0 && (
        <p className="text-[9px] text-vault-text-secondary/60 italic">
          No scopes available. Contact administrator for access.
        </p>
      )}
    </div>
  );
};
