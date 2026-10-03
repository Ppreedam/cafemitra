using System.Drawing.Printing;

namespace Print_Agent
{
    // Tab strip on the Printer Setup screen: "B/W & Color" is the existing
    // preset editor, untouched; Duplex, A3 and 4x6 Photo each get a small
    // single-printer card. Built in code so the Designer layout of the
    // existing screen is not edited.
    public partial class Form1
    {
        private enum SetupTab { Presets, Duplex }

        private const int SetupTabsHeight = 44;

        private Panel _pnlSetupTabs;
        private Panel _pnlSlot;
        private readonly Dictionary<SetupTab, Button> _tabButtons = new();
        private SetupTab _activeTab = SetupTab.Presets;

        // Slot card controls (shared by the Duplex / A3 / Photo tabs).
        private Label _slotTitle, _slotSub, _slotModeLabel, _slotNote, _slotBadge;
        private ComboBox _slotPrinter;
        private RadioButton _slotAuto, _slotManual;
        private Button _slotSave;
        private bool _slotLoading;

        private void InitSetupTabs()
        {
            // Room for the tab strip in the fixed-size window.
            ClientSize = new Size(ClientSize.Width, ClientSize.Height + SetupTabsHeight);
            MinimumSize = new Size(MinimumSize.Width, MinimumSize.Height + SetupTabsHeight);
            MaximumSize = new Size(MaximumSize.Width, MaximumSize.Height + SetupTabsHeight);

            _pnlSetupTabs = new Panel { Dock = DockStyle.Top, Height = SetupTabsHeight, BackColor = Theme.PageBg };
            var labels = new (SetupTab Tab, string Text)[]
            {
                (SetupTab.Presets, "B/W & Color"),
                (SetupTab.Duplex, "Duplex"),
            };
            var width = 364 / labels.Length;
            for (var i = 0; i < labels.Length; i++)
            {
                var tab = labels[i].Tab;
                var button = new Button { Text = labels[i].Text, Location = new Point(i * width, 6), Size = new Size(width - 4, 32) };
                Theme.StyleSecondaryButton(button);
                button.Height = 32;
                button.Click += (_, _) => SelectSetupTab(tab);
                _tabButtons[tab] = button;
                _pnlSetupTabs.Controls.Add(button);
            }
            pnlSettings.Controls.Add(_pnlSetupTabs);
            // Docks directly under the header (higher index docks first).
            pnlSettings.Controls.SetChildIndex(_pnlSetupTabs, pnlSettings.Controls.GetChildIndex(pnlSettingsHeader));

            BuildSlotCard();
            SelectSetupTab(SetupTab.Presets);
        }

        private void BuildSlotCard()
        {
            _pnlSlot = new Panel { Dock = DockStyle.Fill, BackColor = Color.White, Visible = false, Padding = new Padding(0) };
            Theme.StyleRoundedCard(_pnlSlot);

            _slotTitle = new Label { Font = Theme.FontPageTitle, ForeColor = Theme.DeepNavy, AutoSize = true, Location = new Point(24, 16) };
            _slotSub = new Label { Font = Theme.FontLabel, ForeColor = Theme.TextMuted, AutoSize = true, Location = new Point(24, 46) };

            var printerLabel = new Label { Text = "Printer", Font = Theme.FontLabel, ForeColor = Theme.TextMuted, AutoSize = true, Location = new Point(24, 78) };
            _slotPrinter = new BorderedCombo { Location = new Point(24, 96), Width = 316 };
            _slotPrinter.SelectedIndexChanged += (_, _) => RefreshSlotStatus();

            _slotModeLabel = new Label { Text = "Print Mode", Font = Theme.FontLabel, ForeColor = Theme.TextMuted, AutoSize = true, Location = new Point(24, 136) };
            _slotAuto = new RadioButton { Text = "Duplex (Auto)", AutoSize = true, Location = new Point(24, 156), Font = Theme.FontBody };
            _slotManual = new RadioButton { Text = "Manual (Flip Pages)", AutoSize = true, Location = new Point(24, 180), Font = Theme.FontBody };
            _slotAuto.CheckedChanged += (_, _) => RefreshSlotStatus();

            _slotNote = new Label { Location = new Point(24, 212), Size = new Size(316, 52), Font = Theme.FontLabel, ForeColor = Theme.TextMuted };

            _slotBadge = new Label { Location = new Point(24, 270), Size = new Size(316, 32), TextAlign = ContentAlignment.MiddleCenter, Font = Theme.FontLabelBold };

            _slotSave = new Button { Text = "Save", Location = new Point(24, 312), Size = new Size(316, 40) };
            Theme.StylePrimaryButton(_slotSave);
            _slotSave.Height = 40;
            _slotSave.Click += (_, _) => SaveSlotCard();

            _pnlSlot.Controls.AddRange(new Control[] { _slotTitle, _slotSub, printerLabel, _slotPrinter, _slotModeLabel, _slotAuto, _slotManual, _slotNote, _slotBadge, _slotSave });
            // Widths follow the card (it is docked, so its real size is only
            // known after layout) instead of anchoring to a guessed size.
            _pnlSlot.SizeChanged += (_, _) =>
            {
                var inner = Math.Max(120, _pnlSlot.ClientSize.Width - 48);
                _slotPrinter.Width = _slotNote.Width = _slotBadge.Width = _slotSave.Width = inner;
            };
            pnlSettings.Controls.Add(_pnlSlot);
            pnlSettings.Controls.SetChildIndex(_pnlSlot, 0); // Fill docks last
        }

        private void SelectSetupTab(SetupTab tab)
        {
            _activeTab = tab;
            foreach (var (key, button) in _tabButtons)
            {
                if (key == tab)
                {
                    Theme.StylePrimaryButton(button);
                }
                else
                {
                    Theme.StyleSecondaryButton(button);
                }
                button.Height = 32;
            }

            var presets = tab == SetupTab.Presets;
            pnlSettingsCard.Visible = presets;
            pnlSettingsSpacer.Visible = presets;
            dataGridPrinterSetting.Visible = presets;
            _pnlSlot.Visible = !presets;
            if (!presets) LoadSlotCard();
        }

        private string SlotSavedPrinter() => _config.DuplexPrinter ?? "";

        private void LoadSlotCard()
        {
            _slotLoading = true;
            try
            {
                var isDuplex = _activeTab == SetupTab.Duplex;
                _slotTitle.Text = "Duplex Printer";
                _slotSub.Text = "For double-side prints";
                _slotModeLabel.Visible = _slotAuto.Visible = _slotManual.Visible = isDuplex;
                _slotAuto.Checked = DuplexPrintService.NormalizeMode(_config.DuplexMode) == DuplexPrintService.ModeAuto;
                _slotManual.Checked = !_slotAuto.Checked;

                var saved = SlotSavedPrinter();
                var installed = PrinterSettings.InstalledPrinters.Cast<string>().ToList();
                _slotPrinter.Items.Clear();
                _slotPrinter.Items.Add("— Select a printer —");
                foreach (var name in installed) _slotPrinter.Items.Add(name);
                if (saved.Length > 0 && !installed.Contains(saved, StringComparer.OrdinalIgnoreCase))
                {
                    _slotPrinter.Items.Add(saved + " (not found)");
                    _slotPrinter.SelectedIndex = _slotPrinter.Items.Count - 1;
                }
                else
                {
                    var index = saved.Length == 0 ? 0 : installed.FindIndex(n => n.Equals(saved, StringComparison.OrdinalIgnoreCase)) + 1;
                    _slotPrinter.SelectedIndex = Math.Max(0, index);
                }

                // Mode radios sit higher up when they are hidden.
                var shift = isDuplex ? 0 : -76;
                _slotNote.Top = 212 + shift;
                _slotBadge.Top = 270 + shift;
                _slotSave.Top = 312 + shift;
            }
            finally
            {
                _slotLoading = false;
            }
            RefreshSlotStatus();
        }

        private string SlotSelectedPrinter()
        {
            if (_slotPrinter.SelectedIndex <= 0 || _slotPrinter.SelectedItem is not string selected) return "";
            return selected.EndsWith(" (not found)") ? SlotSavedPrinter() : selected;
        }

        private void RefreshSlotStatus()
        {
            if (_slotLoading) return;
            var printer = SlotSelectedPrinter();
            var notFound = _slotPrinter.SelectedItem is string sel && sel.EndsWith(" (not found)");
            var (text, color, back) = ("Printer Ready", Theme.Success, Color.FromArgb(230, 247, 244));
            var note = "";

            if (notFound)
            {
                (text, color, back) = ("Printer Not Found", Theme.Danger, Color.FromArgb(254, 235, 235));
            }
            else if (printer.Length == 0)
            {
                (text, color, back) = ("No printer selected", Theme.Warning, Color.FromArgb(255, 244, 229));
                note = "Customers will not be offered double-side printing until a printer is set.";
            }
            else if (_activeTab == SetupTab.Duplex && _slotAuto.Checked && !DuplexPrintService.CanDuplex(printer))
            {
                (text, color, back) = ("Auto duplex not available", Theme.Warning, Color.FromArgb(255, 244, 229));
                note = "This printer does not report automatic two-side printing. Choose Manual (Flip Pages), otherwise double-side is not offered to customers.";
            }

            _slotBadge.Text = text;
            _slotBadge.ForeColor = color;
            _slotBadge.BackColor = back;
            _slotNote.Text = note;
        }

        private void SaveSlotCard()
        {
            SaveDuplexSettingsFromLocalApi(new DuplexSettingsDto
            {
                Printer = SlotSelectedPrinter(),
                Mode = _slotManual.Checked ? DuplexPrintService.ModeManual : DuplexPrintService.ModeAuto,
            });

            _slotSave.Text = "Saved ✓";
            var timer = new System.Windows.Forms.Timer { Interval = 1500 };
            timer.Tick += (_, _) => { _slotSave.Text = "Save"; timer.Stop(); timer.Dispose(); };
            timer.Start();
        }
    }
}

namespace Print_Agent
{
    /// Flat dropdown that still looks like one: the stock FlatStyle.Flat
    /// ComboBox has no border and (once the card is wider than the control)
    /// no visible arrow, so it reads as plain text. This paints a clear
    /// border and a chevron on top of it.
    internal sealed class BorderedCombo : ComboBox
    {
        private const int WM_PAINT = 0x000F;

        public BorderedCombo()
        {
            DropDownStyle = ComboBoxStyle.DropDownList;
            FlatStyle = FlatStyle.Flat;
            Font = new Font("Segoe UI", 10F);
            BackColor = Color.White;
            ForeColor = Theme.DeepNavy;
            Cursor = Cursors.Hand;
        }

        protected override void WndProc(ref Message m)
        {
            base.WndProc(ref m);
            if (m.Msg != WM_PAINT) return;

            using var g = Graphics.FromHwnd(Handle);
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            var border = Focused ? Theme.Primary : ColorTranslator.FromHtml("#94A3B8");

            // Arrow well on the right.
            var well = new Rectangle(Width - 30, 1, 29, Height - 2);
            using (var fill = new SolidBrush(ColorTranslator.FromHtml("#F1F5F9")))
            {
                g.FillRectangle(fill, well);
            }
            using (var divider = new Pen(ColorTranslator.FromHtml("#CBD5E1")))
            {
                g.DrawLine(divider, well.Left, 4, well.Left, Height - 5);
            }

            // Chevron.
            var cx = well.Left + well.Width / 2;
            var cy = Height / 2;
            using (var chevron = new Pen(Theme.DeepNavy, 2f) { StartCap = System.Drawing.Drawing2D.LineCap.Round, EndCap = System.Drawing.Drawing2D.LineCap.Round })
            {
                g.DrawLines(chevron, new[] { new Point(cx - 4, cy - 2), new Point(cx, cy + 2), new Point(cx + 4, cy - 2) });
            }

            using var pen = new Pen(border, Focused ? 1.6f : 1f);
            g.DrawRectangle(pen, 0, 0, Width - 1, Height - 1);
        }
    }
}
