import React, { useState, useEffect } from 'react';
import type { AGiXTConfig } from '../lib/agixt-service';
import { getPuter } from '../lib/puter';

interface AGiXTSettingsProps {
  onClose: () => void;
  onSave: (config: AGiXTConfig) => void;
}

export default function AGiXTSettings({ onClose, onSave }: AGiXTSettingsProps) {
  const [config, setConfig] = useState<AGiXTConfig>({
    baseUri: '',
    authToken: '',
    enabled: false,
  });

  useEffect(() => {
    const loadConfig = async () => {
      const puter = getPuter();
      if (puter.kv) {
        const savedConfig = await puter.kv.get('agixt_config');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    const puter = getPuter();
    if (puter.kv) {
      await puter.kv.set('agixt_config', JSON.stringify(config));
      onSave(config);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">AGiXT Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="enabled">Enable AGiXT Integration</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Base URI</label>
            <input
              type="text"
              value={config.baseUri}
              onChange={(e) => setConfig({ ...config, baseUri: e.target.value })}
              placeholder="https://your-agixt-instance.com"
              className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Auth Token</label>
            <input
              type="password"
              value={config.authToken}
              onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
              placeholder="Your AGiXT auth token"
              className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-background/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}