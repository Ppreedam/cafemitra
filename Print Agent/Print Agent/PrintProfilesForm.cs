using System.Drawing.Printing;

namespace Print_Agent
{
    /// "Print Profiles" window: name a profile, pick a printer, set that
    /// printer's own Preferences (paper size, glossy paper, best quality...)
    /// and save. A job that arrives with that profile name prints on that
    /// printer with exactly those settings - see Form1.ProcessJobCoreAsync.
    internal sealed class PrintProfilesForm : Form
    {
        private const string NewProfileItem = "+ New profile";

        private readonly ListBox _profiles;
        private readonly TextBox _name;
        private readonly ListBox _printers;
        private readonly Button _preferences, _save, _delete;
        private readonly Label _status;

        private List<PrintProfile> _saved = PrintProfileStore.Load();
        private PrintProfile? _editing;      // null = creating a new profile
        private byte[]? _devMode;            // settings captured for _devModePrinter
        private string _devModePrinter = "";
        private bool _loading;

        public PrintProfilesForm()
        {
            Text = "Print Profiles";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = MinimizeBox = false;
            StartPosition = FormStartPosition.CenterParent;
            ClientSize = new Size(640, 470);
            BackColor = Theme.PageBg;
            Font = Theme.FontBody;
            ShowInTaskbar = false;

            // ── Left: saved profiles ─────────────────────────────────
            var savedLabel = new Label { Text = "Saved profiles", Font = Theme.FontLabelBold, ForeColor = Theme.DeepNavy, AutoSize = true, Location = new Point(16, 16) };
            _profiles = new ListBox { Location = new Point(16, 40), Size = new Size(220, 360), IntegralHeight = false, BorderStyle = BorderStyle.FixedSingle };
            _profiles.SelectedIndexChanged += (_, _) => OnProfileSelected();

            _delete = new Button { Text = "Delete profile", Location = new Point(16, 412), Size = new Size(220, 40) };
            Theme.StyleDangerOutlineButton(_delete);
            _delete.Click += (_, _) => DeleteProfile();

            // ── Right: editor ────────────────────────────────────────
            var nameLabel = new Label { Text = "Profile name", Font = Theme.FontLabelBold, ForeColor = Theme.DeepNavy, AutoSize = true, Location = new Point(256, 16) };
            _name = new TextBox { Location = new Point(256, 40), Width = 368, PlaceholderText = "e.g. 4x6-photo-print-best-glossy" };
            Theme.StyleTextBox(_name);

            var printerLabel = new Label { Text = "Printer (select to open its preferences)", Font = Theme.FontLabelBold, ForeColor = Theme.DeepNavy, AutoSize = true, Location = new Point(256, 80) };
            _printers = new ListBox { Location = new Point(256, 104), Size = new Size(368, 190), IntegralHeight = false, BorderStyle = BorderStyle.FixedSingle };
            _printers.SelectedIndexChanged += (_, _) => OnPrinterSelected();

            _preferences = new Button { Text = "⚙  Printer Preferences…", Location = new Point(256, 304), Size = new Size(368, 36) };
            Theme.StyleSecondaryButton(_preferences);
            _preferences.Click += (_, _) => OpenPreferences();

            _status = new Label { Location = new Point(256, 348), Size = new Size(368, 52), Font = Theme.FontLabel, ForeColor = Theme.TextMuted };

            _save = new Button { Text = "Save Profile", Location = new Point(256, 412), Size = new Size(368, 40) };
            Theme.StylePrimaryButton(_save);
            _save.Click += (_, _) => SaveProfile();

            Controls.AddRange(new Control[] { savedLabel, _profiles, _delete, nameLabel, _name, printerLabel, _printers, _preferences, _status, _save });
            AcceptButton = _save;

            foreach (string printer in PrinterSettings.InstalledPrinters) _printers.Items.Add(printer);
            RefreshProfileList(null);
        }

        private void RefreshProfileList(string? selectName)
        {
            _loading = true;
            try
            {
                _profiles.Items.Clear();
                _profiles.Items.Add(NewProfileItem);
                foreach (var profile in _saved) _profiles.Items.Add(profile.Name);
            }
            finally
            {
                _loading = false;
            }

            var index = selectName == null ? 0 : _profiles.Items.IndexOf(selectName);
            _profiles.SelectedIndex = Math.Max(0, index);
        }

        private void OnProfileSelected()
        {
            if (_loading) return;
            _editing = _profiles.SelectedIndex > 0 ? _saved[_profiles.SelectedIndex - 1] : null;

            _loading = true;
            try
            {
                _name.Text = _editing?.Name ?? "";
                _devMode = _editing?.DevModeBytes();
                _devModePrinter = _editing?.Printer ?? "";
                _printers.SelectedIndex = _editing == null ? -1 : _printers.Items.IndexOf(_editing.Printer);
            }
            finally
            {
                _loading = false;
            }

            _delete.Enabled = _editing != null;
            if (_editing != null && _printers.SelectedIndex < 0)
            {
                SetStatus($"Printer \"{_editing.Printer}\" is not installed on this PC. Pick another printer and set its preferences.", Theme.Danger);
            }
            else
            {
                UpdateStatus();
            }
            if (_editing == null) _name.Focus();
        }

        private string SelectedPrinter => _printers.SelectedItem as string ?? "";

        private void OnPrinterSelected()
        {
            if (_loading) return;
            UpdateStatus();
            // Selecting a printer goes straight into its preferences, so the
            // owner sets paper size / paper type / quality right away.
            if (SelectedPrinter.Length > 0) BeginInvoke(new Action(OpenPreferences));
        }

        private void OpenPreferences()
        {
            var printer = SelectedPrinter;
            if (printer.Length == 0)
            {
                SetStatus("Select a printer first.", Theme.Warning);
                return;
            }

            try
            {
                // Re-opening for the same printer starts from what was chosen
                // last time; a different printer starts from its defaults.
                var current = printer.Equals(_devModePrinter, StringComparison.OrdinalIgnoreCase) ? _devMode : null;
                var chosen = PrinterDevMode.ShowPreferences(this, printer, current);
                if (chosen != null)
                {
                    _devMode = chosen;
                    _devModePrinter = printer;
                }
            }
            catch (Exception ex)
            {
                SetStatus(ex.Message, Theme.Danger);
                return;
            }

            UpdateStatus();
        }

        private bool HasSettingsForSelectedPrinter =>
            SelectedPrinter.Length > 0
            && _devMode is { Length: > 0 }
            && SelectedPrinter.Equals(_devModePrinter, StringComparison.OrdinalIgnoreCase);

        private void UpdateStatus()
        {
            if (SelectedPrinter.Length == 0)
            {
                SetStatus("Select the printer this profile should use.", Theme.TextMuted);
            }
            else if (!HasSettingsForSelectedPrinter)
            {
                SetStatus("Printer preferences not set yet - click \"Printer Preferences…\", choose your settings and press OK.", Theme.Warning);
            }
            else
            {
                var summary = PrinterDevMode.Describe(new PrintProfile { Printer = SelectedPrinter, DevMode = Convert.ToBase64String(_devMode!) });
                SetStatus($"✓ Preferences captured{(summary.Length > 0 ? ": " + summary : "")}", Theme.Success);
            }
        }

        private void SetStatus(string text, Color color)
        {
            _status.Text = text;
            _status.ForeColor = color;
        }

        private void SaveProfile()
        {
            var name = _name.Text.Trim();
            if (name.Length == 0)
            {
                SetStatus("Type a profile name.", Theme.Danger);
                _name.Focus();
                return;
            }
            if (SelectedPrinter.Length == 0)
            {
                SetStatus("Select a printer.", Theme.Danger);
                return;
            }
            if (!HasSettingsForSelectedPrinter)
            {
                SetStatus("Open \"Printer Preferences…\" and press OK so the settings can be saved with this profile.", Theme.Danger);
                return;
            }

            var clash = _saved.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase) && !ReferenceEquals(p, _editing));
            if (clash != null)
            {
                var answer = MessageBox.Show(this, $"A profile named \"{clash.Name}\" already exists. Replace it?", "Print Profiles", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (answer != DialogResult.Yes) return;
                _saved.Remove(clash);
            }

            if (_editing != null) _saved.Remove(_editing);
            _saved.Add(new PrintProfile
            {
                Name = name,
                Printer = SelectedPrinter,
                DevMode = Convert.ToBase64String(_devMode!),
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            });

            try
            {
                PrintProfileStore.Save(_saved);
            }
            catch (Exception ex)
            {
                SetStatus($"Could not save: {ex.Message}", Theme.Danger);
                return;
            }

            _saved = PrintProfileStore.Load();
            RefreshProfileList(_saved.First(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase)).Name);
            SetStatus($"✓ Profile \"{name}\" saved. Jobs with this profile name will print on {SelectedPrinter} with these settings.", Theme.Success);
        }

        private void DeleteProfile()
        {
            if (_editing == null) return;
            var answer = MessageBox.Show(this, $"Delete profile \"{_editing.Name}\"?", "Print Profiles", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
            if (answer != DialogResult.Yes) return;

            _saved.Remove(_editing);
            try
            {
                PrintProfileStore.Save(_saved);
            }
            catch (Exception ex)
            {
                SetStatus($"Could not delete: {ex.Message}", Theme.Danger);
                return;
            }
            _saved = PrintProfileStore.Load();
            RefreshProfileList(null);
        }
    }
}
