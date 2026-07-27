import { Check, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function AccountSection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const checkUsername = (value: string) => {
    if (value.length === 0) {
      setUsernameAvailable(null);
      return;
    }
    setTimeout(() => {
      setUsernameAvailable(value.length > 3);
    }, 500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-spotify">Account Settings</h2>

        <div className="space-y-6 bg-spotify-dark-surface p-7 rounded-2xl border border-white/5 shadow-spotify-md">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="text-[13px] font-bold text-spotify-silver mb-3 block uppercase tracking-spotify"
            >
              Username
            </label>
            <div className="relative group">
              <input
                id="username"
                type="text"
                defaultValue="johndeveloper"
                onChange={(e) => checkUsername(e.target.value)}
                className="w-full h-12 px-5 pr-12 bg-spotify-near-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-spotify-green transition-all font-medium"
              />
              {usernameAvailable !== null && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check className="w-5 h-5 text-spotify-green" />
                  ) : (
                    <X className="w-5 h-5 text-spotify-negative" />
                  )}
                </div>
              )}
            </div>
            {usernameAvailable !== null && (
              <p
                className={`text-[12px] mt-2 font-bold uppercase tracking-spotify ${
                  usernameAvailable ? "text-spotify-green" : "text-spotify-negative"
                }`}
              >
                {usernameAvailable
                  ? "Username is available"
                  : "Username is already taken"}
              </p>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Password */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <label className="text-[14px] font-bold text-white mb-1 block">Account Password</label>
              <p className="text-[13px] text-spotify-silver">Last changed 3 months ago</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="btn-pill-secondary h-11 px-8"
            >
              Change Password
            </Button>
          </div>

          <div className="h-px bg-white/5" />

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-spotify-green/10 flex items-center justify-center text-spotify-green">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-white mb-1">
                  Two-Factor Authentication
                </h4>
                <p className="text-[13px] text-spotify-silver font-medium">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>

            <Switch 
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
              className="data-[state=checked]:bg-spotify-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
