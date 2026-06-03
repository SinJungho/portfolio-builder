"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Block } from "@/stores/portfolioStore";

interface ContactSettingsPanelProps {
  contactBlock?: Block;
  handleOptionalChange: (field: string, value: string) => void;
}

export const ContactSettingsPanel = React.memo(function ContactSettingsPanel({
  contactBlock,
  handleOptionalChange,
}: ContactSettingsPanelProps): React.ReactElement {
  return (
    <div className="bg-spotify-dark-surface border border-white/5 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-spotify space-y-6 text-white">
      <div className="space-y-1 font-normal">
        <h3 className="text-[18px] sm:text-[20px] font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-spotify-green fill-current" />
          연락처 보완
        </h3>
        <p className="text-[13px] sm:text-[14px] text-spotify-silver font-medium">
          소셜 링크를 추가해 신뢰도를 높여보세요.
        </p>
      </div>

      {contactBlock ? (
        <div className="space-y-4">
          <div className="space-y-1.5 font-normal">
            <Label htmlFor="email" className="text-sm font-bold text-spotify-silver">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              className="rounded-xl border-white/5 bg-spotify-near-black text-white focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all h-11 placeholder:text-spotify-silver/30"
              defaultValue={(contactBlock.config?.email as string) || ""}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                handleOptionalChange("email", e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5 font-normal">
            <Label htmlFor="linkedin" className="text-sm font-bold text-spotify-silver">
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              className="rounded-xl border-white/5 bg-spotify-near-black text-white focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all h-11 placeholder:text-spotify-silver/30"
              defaultValue={(contactBlock.config?.linkedin_url as string) || ""}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                handleOptionalChange("linkedin_url", e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5 font-normal">
            <Label htmlFor="website" className="text-sm font-bold text-spotify-silver">
              개인 웹사이트
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://..."
              className="rounded-xl border-white/5 bg-spotify-near-black text-white focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all h-11 placeholder:text-spotify-silver/30"
              defaultValue={(contactBlock.config?.website_url as string) || ""}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                handleOptionalChange("website_url", e.target.value)
              }
            />
          </div>
        </div>
      ) : (
        <div className="text-[13px] text-spotify-silver bg-spotify-near-black/50 p-4 rounded-2xl border border-dashed border-white/5 text-center font-normal">
          연락처 블록을 찾을 수 없습니다.
        </div>
      )}
    </div>
  );
});
