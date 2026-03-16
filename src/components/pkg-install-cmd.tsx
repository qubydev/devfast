"use client";

import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoCopy } from "react-icons/io5";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

export function PkgInstallCmd({ pkg }: { pkg: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const command = `npx devfast create ${pkg}`;

    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy.");
      });
  }

  return (
    <div className="flex items-center gap-2 border rounded-md bg-muted/40 px-3 py-2 w-fit max-w-full font-mono text-sm">

      <span className="text-muted-foreground">$</span>

      <span className="flex items-center gap-1 truncate text-muted-foreground">
        <span>npx</span>
        <span>devfast</span>
        <span>create</span>
        <span className="text-blue-500 font-semibold">{pkg}</span>
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-6 w-6 shrink-0"
      >
        {copied ? (
          <FaCheck className="size-3.5 text-muted-foreground" />
        ) : (
          <IoCopy className="size-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}