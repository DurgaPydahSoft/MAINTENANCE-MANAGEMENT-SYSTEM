import React, { useEffect } from 'react';
import { setPageTitle } from '../utils/pageTitle';

export default function Settings() {
  useEffect(() => {
    setPageTitle('Settings');
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-4">This is a placeholder for application settings. You can add profile, preferences, integrations, and other admin settings here.</p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Coming soon</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>User profile & password</li>
            <li>Notification preferences</li>
            <li>Integrations (S3, Email, etc.)</li>
            <li>Roles & permissions management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
