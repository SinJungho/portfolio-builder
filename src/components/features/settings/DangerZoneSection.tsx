import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DangerZoneSection() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-spotify">Danger Zone</h2>

        <div className="bg-spotify-negative/5 border border-spotify-negative/20 rounded-2xl p-7 shadow-spotify-md">
          <div className="flex flex-col sm:flex-row items-start gap-8 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-spotify-negative/10 flex items-center justify-center text-spotify-negative shrink-0 shadow-[0_0_20px_rgba(243,114,127,0.1)]">
              <AlertTriangle className="w-8 h-8" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[20px] font-black text-white mb-2 tracking-tight">Delete Account</h3>
              <p className="text-[15px] text-spotify-silver font-medium leading-relaxed max-w-lg">
                Once you delete your account, there is no going back. All your portfolios, analytic data, and custom configurations will be <span className="text-spotify-negative font-bold italic">permanently deleted</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-spotify-negative/10">
            <p className="text-[12px] font-bold text-spotify-negative uppercase tracking-spotify-wide">
              Proceed with extreme caution
            </p>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto h-12 px-10 rounded-full border-2 border-spotify-negative text-spotify-negative hover:bg-spotify-negative hover:text-white transition-all font-black uppercase tracking-spotify"
            >
              <Trash2 className="w-4.5 h-4.5 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
