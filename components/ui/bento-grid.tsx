"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 group/bento transition duration-300 p-6 bg-vault-surface border border-vault-border justify-between flex flex-col space-y-4",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-300">
        <div className="text-vault-accent">
          {icon}
        </div>
        <div className="font-serif text-lg text-vault-text-primary mb-1 mt-3">
          {title}
        </div>
        <div className="font-sans text-[11px] uppercase tracking-wider text-vault-text-secondary">
          {description}
        </div>
      </div>
    </div>
  );
};
