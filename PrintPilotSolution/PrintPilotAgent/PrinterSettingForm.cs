using System.Drawing;
using System.Windows.Forms;

namespace PrintPilotAgent;

/// Lets the shop owner save named Printer + Paper Size + Color/Grayscale
/// combinations, edit or delete them later, and see them all in a grid.
/// Kept deliberately simple - no per-driver Media Type/Quality options.
internal sealed class PrinterSettingForm : Form
{
    private readonly ComboBox _printer = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly ComboBox _paperSize = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly ComboBox _colorMode = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly FlatButton _saveSettings;
    private readonly DataGridView _grid = new();
    private readonly Label _status = new();

    private readonly List<PrinterPreset> _presets;
    private int? _editingIndex;

    private const int DeleteColumnIndex = 3;

    public PrinterSettingForm(string? initialPrinterName)
    {
        _saveSettings = (FlatButton?)Theme.PillButton("Save Settings", Theme.Brand, Color.White);
        _presets = PrinterSettingStore.Load();

        Text = "Printer Setting";
        Width = 760;
        Height = 520;
        MinimumSize = new Size(680, 420);
        StartPosition = FormStartPosition.CenterParent;
        Font = new Font("Segoe UI", 9.5f);
        BackColor = Theme.Background;

        BuildUi();

        _printer.Items.Clear();
        foreach (var printer in PrinterService.ListPrinters())
        {
            _printer.Items.Add(printer);
        }

        if (!string.IsNullOrWhiteSpace(initialPrinterName) && _printer.Items.Contains(initialPrinterName))
        {
            _printer.SelectedItem = initialPrinterName;
        }
        else if (_printer.Items.Count > 0)
        {
            _printer.SelectedIndex = 0;
        }

        _paperSize.SelectedIndex = 0;
        _colorMode.SelectedIndex = 0;

        RefreshGrid();
    }

    private void BuildUi()
    {
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, Padding = new Padding(20), ColumnCount = 1, RowCount = 3 };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        Controls.Add(root);

        var pickerCard = Theme.Card();
        pickerCard.Dock = DockStyle.Top;
        pickerCard.AutoSize = true;
        var pickerLayout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 4, AutoSize = true };
        pickerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 34));
        pickerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 33));
        pickerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 33));
        pickerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));

        _printer.Dock = DockStyle.Fill;
        _printer.Height = 32;
        pickerLayout.Controls.Add(Field("Printer", _printer), 0, 0);

        _paperSize.Dock = DockStyle.Fill;
        _paperSize.Height = 32;
        _paperSize.Items.AddRange(PrinterSettingStore.PaperSizes);
        pickerLayout.Controls.Add(Field("Paper Size", _paperSize), 1, 0);

        _colorMode.Dock = DockStyle.Fill;
        _colorMode.Height = 32;
        _colorMode.Items.AddRange(PrinterSettingStore.ColorModes);
        pickerLayout.Controls.Add(Field("Color / Grayscale", _colorMode), 2, 0);

        _saveSettings.Width = 130;
        _saveSettings.Margin = new Padding(10, 26, 0, 0);
        _saveSettings.Click += (_, _) => SaveSettings();
        pickerLayout.Controls.Add(_saveSettings, 3, 0);

        pickerCard.Controls.Add(pickerLayout);
        root.Controls.Add(pickerCard);

        _status.AutoSize = true;
        _status.ForeColor = Theme.Muted;
        _status.Padding = new Padding(2, 8, 0, 4);
        root.Controls.Add(_status);

        var gridCard = Theme.Card();
        gridCard.Dock = DockStyle.Fill;
        var gridLayout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1 };
        BuildGrid();
        gridLayout.Controls.Add(_grid);
        gridCard.Controls.Add(gridLayout);
        root.Controls.Add(gridCard);
    }

    private void BuildGrid()
    {
        _grid.Dock = DockStyle.Fill;
        _grid.ReadOnly = true;
        _grid.AllowUserToAddRows = false;
        _grid.AllowUserToDeleteRows = false;
        _grid.AllowUserToResizeRows = false;
        _grid.RowHeadersVisible = false;
        _grid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        _grid.MultiSelect = false;
        _grid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
        _grid.BackgroundColor = Color.White;
        _grid.BorderStyle = BorderStyle.None;

        _grid.Columns.Add("Printer", "Printer");
        _grid.Columns.Add("PaperSize", "Page Size");
        _grid.Columns.Add("ColorMode", "Color");
        _grid.Columns.Add(new DataGridViewButtonColumn
        {
            Name = "Delete",
            HeaderText = "",
            Text = "Delete",
            UseColumnTextForButtonValue = true,
            Width = 80,
        });

        _grid.CellContentClick += (_, e) =>
        {
            if (e.RowIndex < 0) return;
            if (e.ColumnIndex == DeleteColumnIndex)
            {
                DeletePreset(e.RowIndex);
            }
            else
            {
                LoadPresetIntoEditor(e.RowIndex);
            }
        };
    }

    private static Control Field(string label, Control input)
    {
        var panel = new TableLayoutPanel { Dock = DockStyle.Fill, AutoSize = true, RowCount = 2, Margin = new Padding(0, 0, 10, 0) };
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.Controls.Add(new Label
        {
            Text = label,
            AutoSize = true,
            ForeColor = Theme.Muted,
            Font = new Font("Segoe UI", 9, FontStyle.Bold),
            Margin = new Padding(0, 0, 0, 4),
        }, 0, 0);
        input.Margin = new Padding(0);
        panel.Controls.Add(input, 0, 1);
        return panel;
    }

    private void RefreshGrid()
    {
        _grid.Rows.Clear();
        foreach (var preset in _presets)
        {
            _grid.Rows.Add(preset.PrinterName, preset.PaperSize, preset.ColorMode, "Delete");
        }
    }

    private void LoadPresetIntoEditor(int rowIndex)
    {
        if (rowIndex < 0 || rowIndex >= _presets.Count) return;
        var preset = _presets[rowIndex];
        _editingIndex = rowIndex;

        if (_printer.Items.Contains(preset.PrinterName))
        {
            _printer.SelectedItem = preset.PrinterName;
        }

        if (_paperSize.Items.Contains(preset.PaperSize))
        {
            _paperSize.SelectedItem = preset.PaperSize;
        }

        if (_colorMode.Items.Contains(preset.ColorMode))
        {
            _colorMode.SelectedItem = preset.ColorMode;
        }

        _status.Text = $"Editing saved setting for {preset.PrinterName}.";
    }

    private void DeletePreset(int rowIndex)
    {
        if (rowIndex < 0 || rowIndex >= _presets.Count) return;
        var preset = _presets[rowIndex];
        if (MessageBox.Show(this, $"Delete saved setting for {preset.PrinterName} ({preset.PaperSize}, {preset.ColorMode})?",
            "Delete setting", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
        {
            return;
        }

        _presets.RemoveAt(rowIndex);
        PrinterSettingStore.Save(_presets);
        _editingIndex = null;
        RefreshGrid();
        _status.Text = "Setting deleted.";
    }

    private void SaveSettings()
    {
        var printerName = Convert.ToString(_printer.SelectedItem) ?? "";
        var paperSize = Convert.ToString(_paperSize.SelectedItem) ?? "";
        var colorMode = Convert.ToString(_colorMode.SelectedItem) ?? "";
        if (string.IsNullOrWhiteSpace(printerName) || string.IsNullOrWhiteSpace(paperSize) || string.IsNullOrWhiteSpace(colorMode))
        {
            MessageBox.Show(this, "Choose printer, paper size and color mode.", "Printer Setting", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        var preset = new PrinterPreset { PrinterName = printerName, PaperSize = paperSize, ColorMode = colorMode };

        if (_editingIndex is int index && index < _presets.Count)
        {
            _presets[index] = preset;
        }
        else
        {
            var duplicate = _presets.FindIndex(p =>
                p.PrinterName == preset.PrinterName && p.PaperSize == preset.PaperSize && p.ColorMode == preset.ColorMode);

            if (duplicate >= 0)
            {
                _presets[duplicate] = preset;
            }
            else
            {
                _presets.Add(preset);
            }
        }

        PrinterSettingStore.Save(_presets);
        _editingIndex = null;
        RefreshGrid();
        _status.Text = "Setting saved.";
    }
}
