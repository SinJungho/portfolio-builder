import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileSection() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-spotify">Profile Information</h2>

        <form className="space-y-8 bg-spotify-dark-surface p-8 rounded-[32px] border border-white/5 shadow-spotify-md">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-spotify-mid-dark border-4 border-white/5 shadow-spotify-md overflow-hidden relative">
                 <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-green-border opacity-50 flex items-center justify-center text-black font-black text-xl">JD</div>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                 </div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[14px] font-bold text-white mb-2 uppercase tracking-spotify">Profile Picture</p>
              <p className="text-[13px] text-spotify-silver mb-4">PNG, JPG up to 10MB</p>
              <Button type="button" variant="outline" className="btn-pill-secondary h-10 px-6">
                Change Avatar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="text-[13px] font-bold text-spotify-silver mb-3 block uppercase tracking-spotify"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                defaultValue="John Developer"
                className="w-full h-12 px-5 bg-spotify-near-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-spotify-green transition-all font-medium"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-[13px] font-bold text-spotify-silver mb-3 block uppercase tracking-spotify">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                defaultValue="john@example.com"
                disabled
                className="w-full h-12 px-5 bg-spotify-near-black border border-white/5 rounded-xl text-spotify-silver cursor-not-allowed font-medium opacity-50"
              />
              <p className="text-[12px] text-spotify-silver/50 mt-2 font-medium">
                Email address cannot be changed. Contact support for assistance.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="text-[13px] font-bold text-spotify-silver mb-3 block uppercase tracking-spotify">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                defaultValue="Full-stack developer passionate about building great products and solving complex problems."
                className="w-full px-5 py-4 bg-spotify-near-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-spotify-green transition-all font-medium resize-none"
              />
              <p className="text-[12px] text-spotify-silver/50 mt-2 font-medium">
                Brief description for your profile. Max 200 characters.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="btn-pill-primary h-12 px-10 text-[15px]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
