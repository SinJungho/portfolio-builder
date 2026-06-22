"use client";

import React from "react";
import AccessibilityAlert from "./design/AccessibilityAlert";
import ThemeSelector from "./design/ThemeSelector";
import ColorCustomizer from "./design/ColorCustomizer";
import TypographyAndDetails from "./design/TypographyAndDetails";
import CustomCssEditor from "./design/CustomCssEditor";

export default function DesignEditor() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <AccessibilityAlert />
      <ThemeSelector />
      <ColorCustomizer />
      <TypographyAndDetails />
      <CustomCssEditor />
    </div>
  );
}
