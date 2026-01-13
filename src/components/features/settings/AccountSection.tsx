import { Check, X } from "lucide-react";
import { useState } from "react";

export function AccountSection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const checkUsername = (value: string) => {
    // Simulate username availability check
    setTimeout(() => {
      setUsernameAvailable(value.length > 3);
    }, 500);
  };

  return (
    <div className="space-y-12">
      {/* Account Settings */}
      <div>
        <h2 className="text-gray-900 mb-6">Account Settings</h2>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="text-sm text-gray-700 mb-2 block"
            >
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                defaultValue="johndeveloper"
                onChange={(e) => checkUsername(e.target.value)}
                className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 transition-colors"
              />
              {usernameAvailable !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
              )}
            </div>
            {usernameAvailable !== null && (
              <p
                className={`text-xs mt-1 ${
                  usernameAvailable ? "text-green-600" : "text-red-600"
                }`}
              >
                {usernameAvailable
                  ? "Username is available"
                  : "Username is already taken"}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Password</label>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm text-gray-900 mb-1">
                Two-Factor Authentication
              </h4>
              <p className="text-xs text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>

            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? "bg-gray-900" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
