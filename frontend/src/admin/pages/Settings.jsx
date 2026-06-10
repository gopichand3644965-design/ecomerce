import { useState } from 'react';

export default function Settings() {
  const [storeName, setStoreName] = useState('Pandas Store');
  const [storeEmail, setStoreEmail] = useState('admin@pandasstore.com');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [theme, setTheme] = useState('light');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify({
      storeName,
      storeEmail,
      currency,
      timezone,
      theme,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Admin Settings</h2>
      
      <div className="space-y-6">
        {/* Store Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Store Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <input 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Store Email</label>
              <input 
                type="email"
                value={storeEmail} 
                onChange={(e) => setStoreEmail(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Regional Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
                <option>AUD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select 
                value={timezone} 
                onChange={(e) => setTimezone(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option>UTC</option>
                <option>EST</option>
                <option>CST</option>
                <option>PST</option>
                <option>IST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        {/* Admin Portal Access */}
        <div className="bg-slate-950 text-white p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-4">Admin Portal Access</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>Admin portal: <span className="font-semibold text-white">/admin/login</span></p>
            <p>Username: <span className="font-semibold text-white">admin@pandasstore.com</span></p>
            <p>Password: <span className="font-semibold text-white">Admin@1234</span></p>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Admin Login Preview</div>
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-950 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Email / Username</div>
                <div className="rounded-lg bg-slate-800 px-3 py-2 text-slate-200">admin@pandasstore.com</div>
              </div>
              <div className="rounded-xl bg-slate-950 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Password</div>
                <div className="rounded-lg bg-slate-800 px-3 py-2 text-slate-200">Admin@1234</div>
              </div>
            </div>
          </div>
          <a
            href="/admin/login"
            className="mt-5 inline-flex items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Open Admin Portal
          </a>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Save Settings
          </button>
          {saved && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Settings saved</span>}
        </div>
      </div>
    </div>
  );
}
