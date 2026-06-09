"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const baseClass =
  "inline-flex items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400";

const sizeClass = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const variants = {
  default:
    "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900",
  danger:
    "border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700",
  primary:
    "border-zinc-900 bg-zinc-900 text-white hover:border-zinc-800 hover:bg-zinc-800",
};

interface SharedProps {
  label: string;
  icon: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizeClass;
  testId?: string;
}

interface IconActionButtonProps extends SharedProps {
  onClick?: () => void;
  disabled?: boolean;
}

interface IconActionLinkProps extends SharedProps {
  href: string;
}

function actionClassName(
  variant: keyof typeof variants,
  size: keyof typeof sizeClass,
) {
  return `${baseClass} ${sizeClass[size]} ${variants[variant]}`;
}

export function IconActionButton({
  label,
  icon,
  variant = "default",
  size = "sm",
  testId,
  onClick,
  disabled = false,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={`${actionClassName(variant, size)} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function IconActionLink({
  label,
  icon,
  variant = "default",
  size = "sm",
  testId,
  href,
}: IconActionLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      data-testid={testId}
      className={actionClassName(variant, size)}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
