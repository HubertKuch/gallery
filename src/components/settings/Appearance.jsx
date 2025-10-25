import useSettingsStore from '../../stores/settingsStore';

function Appearance() {
  const { theme, setTheme } = useSettingsStore();

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
    </form>
  );
}

export default Appearance;
