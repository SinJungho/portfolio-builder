import { AlertTriangle } from "lucide-react";

export function DangerZoneSection() {
  return (
    <div>
      <h2 className="text-gray-900 mb-6">Danger Zone</h2>

      <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-red-900 mb-1">Delete Account</h3>
            <p className="text-sm text-red-700">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
          </div>
        </div>

        <button className="px-4 py-2 border-2 border-red-600 text-red-700 rounded-md hover:bg-red-600 hover:text-white transition-colors">
          Delete Account
        </button>

        <p className="text-xs text-red-600 mt-3">
          This action cannot be undone. All your portfolios and data will be
          permanently deleted.
        </p>
      </div>
    </div>
  );
}
