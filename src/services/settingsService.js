import Database from '@tauri-apps/plugin-sql';

class SettingsService {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await Database.load('sqlite:preferences.db');
      await this.db.execute(
        'CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
      );
    }
    return this.db;
  }

  async getSetting(key) {
    const db = await this.getDb();
    const result = await db.select('SELECT value FROM preferences WHERE key = ?', [key]);
    return result.length > 0 ? result[0].value : null;
  }

  async setSetting(key, value) {
    const db = await this.getDb();
    await db.execute(
      'INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)',
      [key, value],
    );
  }
}

const settingsService = new SettingsService();
export default settingsService;
