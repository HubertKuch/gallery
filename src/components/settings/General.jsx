import useSettingsStore from '../../stores/settingsStore';

function General() {
  const {
    theme, setTheme, albumDirectory, setAlbumDirectory,
  } = useSettingsStore();

  return (
    <form>
      <h2 className="text-lg font-semibold mb-4">Appearance</h2>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Light Theme</span>
          <input
            type="radio"
            name="theme"
            className="radio checked:bg-blue-500"
            checked={theme === 'light'}
            onChange={() => setTheme('light')}
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
            onChange={() => setTheme('dark')}
          />
        </label>
      </div>

      <div className="divider" />

      <h2 className="text-lg font-semibold mb-4">Storage</h2>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Default Album Directory</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            className="input input-bordered w-full"
            value={albumDirectory || 'Not set'}
          />
          <button type="button" className="btn" onClick={setAlbumDirectory}>
            Choose...
          </button>
        </div>
      </div>
    </form>
  );
}

export default General;
