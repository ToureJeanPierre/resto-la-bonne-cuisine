"use client";

import { useEffect } from "react";

export default function MarquerLues() {
  useEffect(() => {
    fetch("/api/notifications", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
