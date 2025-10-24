import { useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';

function Appearance() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    async function loadDb() {
      const db = await Database.load('sqlite:preferences.db');
      await db.execute(
        'CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
      );
      const result = await db.select('SELECT value FROM preferences WHERE key = ?', ['theme']);
      if (result.length > 0) {
        setTheme(result[0].value);
      }
    }
    loadDb();
  }, []);

  const handleThemeChange = async (newTheme) => {
    const db = await Database.load('sqlite:preferences.db');
    await db.execute(
      'INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)',
      ['theme', newTheme],
    );
    setTheme(newTheme);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Appearance</h2>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Light Theme</span>
          <input
            type="radio"
            name="theme"
            className="radio checked:bg-blue-500"
            checked={theme === 'light'}
            onChange={() => handleThemeChange('light')}
          />
        </label>
      </div>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Dark Theme</span>
          <input
            type="radio"
            name="theme"
            className="radio checked:bg-blue-500"
            checked={theme === 'dark'}
            onChange={() => handleThemeChange('dark')}
          />
        </label>
      </div>
    </div>
  );
}

export default Appearance;
