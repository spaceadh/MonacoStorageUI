"use client";

import React from "react";
import { Check, Brain, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { InferencePreset, inferencePresets, InferenceConfigDto } from "@/lib/api";

interface InferenceConfigPanelProps {
  enabled: boolean;
  preset: InferencePreset;
  onEnabledChange: (enabled: boolean) => void;
  onPresetChange: (preset: InferencePreset) => void;
}

export function InferenceConfigPanel({
  enabled,
  preset,
  onEnabledChange,
  onPresetChange,
}: InferenceConfigPanelProps) {
  const currentConfig = inferencePresets[preset];

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle Section */}
      <div className="border border-vault-border bg-vault-surface p-4">
        <button
          onClick={() => onEnabledChange(!enabled)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-5 w-5 border-2 flex items-center justify-center transition-colors",
                enabled
                  ? "bg-vault-accent border-vault-accent"
                  : "border-vault-border"
              )}
            >
              {enabled && <Check className="h-3 w-3 text-vault-bg" strokeWidth={3} />}
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs uppercase tracking-wider font-medium text-vault-text-primary flex items-center gap-2">
                <Brain className="h-4 w-4" strokeWidth={1.5} />
                Enable AI Inference Processing
              </span>
              <span className="text-[9px] text-vault-text-secondary uppercase tracking-tighter">
                Extract metadata and enable semantic search
              </span>
            </div>
          </div>
          <div className="text-[10px] font-medium text-vault-text-secondary px-3 py-1 bg-vault-bg border border-vault-border rounded">
            {enabled ? "Active" : "Disabled"}
          </div>
        </button>
      </div>

      {/* Preset Selection (when enabled) */}
      {enabled && (
        <div className="space-y-3 border border-vault-border bg-vault-bg/50 p-4">
          <h4 className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-bold flex items-center gap-2 mb-4">
            <Lock className="h-3 w-3" strokeWidth={2} /> Processing Profile
          </h4>

          <div className="space-y-2">
            {(["private", "public", "team"] as const).map((presetKey) => {
              const presetConfig = inferencePresets[presetKey];
              const isSelected = presetKey === preset;

              return (
                <button
                  key={presetKey}
                  onClick={() => onPresetChange(presetKey)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 border transition-all duration-200",
                    isSelected
                      ? "border-vault-accent bg-vault-accent/5"
                      : "border-vault-border hover:border-vault-accent/50 bg-vault-surface/30"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-vault-accent border-vault-accent"
                        : "border-vault-border"
                    )}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 bg-vault-bg rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium text-vault-text-primary uppercase tracking-tighter">
                      {presetConfig.label}
                    </p>
                    <p className="text-[9px] text-vault-text-secondary mt-1">
                      {presetConfig.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Config Display */}
          {currentConfig.config && (
            <div className="mt-4 pt-4 border-t border-vault-border/50 text-[9px] text-vault-text-secondary space-y-1">
              <p>
                <span className="font-medium text-vault-text-primary">Visibility:</span>{" "}
                {currentConfig.config.visibility}
              </p>
              <p>
                <span className="font-medium text-vault-text-primary">Scope:</span>{" "}
                {currentConfig.config.scope}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="border border-vault-border/50 bg-vault-accent/5 p-3 space-y-2">
        <p className="text-[9px] uppercase tracking-wider text-vault-accent font-bold">
          💡 Processing Details
        </p>
        <p className="text-[10px] text-vault-text-secondary leading-relaxed">
          {enabled
            ? "Your asset will be processed through multi-engine analysis before cold storage encryption. Metadata is extracted and indexed for semantic retrieval."
            : "Asset will be stored securely without AI processing. No semantic indexing will be performed."}
        </p>
      </div>
    </div>
  );
}
