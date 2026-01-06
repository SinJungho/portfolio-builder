import { Camera } from "lucide-react";

export function ProfileSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gray-900 mb-6">Profile Information</h2>

        <form className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="text-sm text-gray-700 mb-3 block">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-300 relative group cursor-pointer">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="text-sm text-gray-700 mb-2 block"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              defaultValue="John Developer"
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              defaultValue="john@example.com"
              disabled
              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact support to change your email address
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="text-sm text-gray-700 mb-2 block">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              defaultValue="Full-stack developer passionate about building great products."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Brief description for your profile. Max 200 characters.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
