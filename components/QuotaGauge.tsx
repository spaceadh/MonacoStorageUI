"use client";
import React from "react";
import { motion } from "framer-motion";

interface QuotaGaugeProps {
    used: number;
    total: number;
    label?: string;
}

export const QuotaGauge = ({ used, total, label = "Storage Quota" }: QuotaGaugeProps) => {
    const percentage = Math.min((used / total) * 100, 100);
    const formattedUsed = (used / (1024 * 1024 * 1024)).toFixed(2);
    const formattedTotal = (total / (1024 * 1024 * 1024)).toFixed(0);

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-[0.2em] text-vault-text-secondary font-medium">
                    {label}
                </label>
                <span className="text-[10px] tabular-nums text-vault-text-secondary">
                    {formattedUsed} GB / {formattedTotal} GB
                </span>
            </div>
            <div className="h-[2px] w-full bg-vault-border relative overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 left-0 h-full bg-vault-accent"
                />
            </div>
        </div>
    );
};
