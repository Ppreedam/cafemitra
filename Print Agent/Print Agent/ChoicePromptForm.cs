using System.Drawing;
using System.Windows.Forms;

namespace Print_Agent;

/// Same branded-popup template as CashConfirmForm (borderless, rounded,
/// teal top bar, draggable, TopMost) with a list to pick one option from -
/// used when a print job could go to more than one printer/profile and the
/// shop has to say which.
internal sealed class ChoicePromptForm : Form
{
    private readonly ListBox lstOptions;

    public int SelectedIndex { get; private set; } = -1;

    public ChoicePromptForm(string title, string message, IReadOnlyList<string> options, string confirmLabel)
    {
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.CenterScreen;
        Size = new Size(460, 400);
        BackColor = Color.White;
        TopMost = true;
        ShowInTaskbar = true;
        KeyPreview = true;

        Region = Region.FromHrgn(NativeMethods.CreateRoundRectRgn(0, 0, Width, Height, 18, 18));
        Paint += (s, e) =>
        {
            using var pen = new Pen(Theme.Teal, 2);
            e.Graphics.DrawRectangle(pen, 1, 1, Width - 3, Height - 3);
        };

        var topBar = new Panel { Dock = DockStyle.Top, Height = 56, BackColor = Theme.Teal };
        var lblTitle = new Label
        {
            Text = title,
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 12F, FontStyle.Bold),
            AutoSize = false,
            TextAlign = ContentAlignment.MiddleLeft,
            Dock = DockStyle.Fill,
            Padding = new Padding(20, 0, 0, 0)
        };
        topBar.Controls.Add(lblTitle);

        var btnClose = new Button
        {
            Text = "✕",
            FlatStyle = FlatStyle.Flat,
            ForeColor = Color.White,
            BackColor = Theme.Teal,
            Size = new Size(40, 40),
            Location = new Point(Width - 48, 8),
            Cursor = Cursors.Hand,
            Anchor = AnchorStyles.Top | AnchorStyles.Right
        };
        btnClose.FlatAppearance.BorderSize = 0;
        btnClose.FlatAppearance.MouseOverBackColor = Color.FromArgb(255, 255, 255, 40);
        btnClose.Click += (s, e) => CancelAndClose();
        topBar.Controls.Add(btnClose);
        btnClose.BringToFront();

        var lblMessage = new Label
        {
            Text = message,
            Font = new Font("Segoe UI", 10F),
            ForeColor = Theme.TextPrimary,
            AutoSize = false,
            TextAlign = ContentAlignment.TopLeft,
            Location = new Point(24, 68),
            Size = new Size(Width - 48, 64)
        };

        lstOptions = new ListBox
        {
            Font = new Font("Segoe UI", 11F),
            Location = new Point(24, 136),
            Size = new Size(Width - 48, 180),
            BorderStyle = BorderStyle.FixedSingle,
            IntegralHeight = false
        };
        foreach (var option in options) lstOptions.Items.Add(option);
        if (lstOptions.Items.Count > 0) lstOptions.SelectedIndex = 0;
        lstOptions.DoubleClick += (s, e) => ConfirmAndClose();

        var btnCancel = new Button
        {
            Text = "Hold Job",
            Size = new Size(160, 42),
            Location = new Point(30, 336),
            Font = new Font("Segoe UI", 10F, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        Theme.StyleSecondaryButton(btnCancel);
        btnCancel.Click += (s, e) => CancelAndClose();

        var btnConfirm = new Button
        {
            Text = confirmLabel,
            Size = new Size(160, 42),
            Location = new Point(Width - 190, 336),
            Font = new Font("Segoe UI", 10F, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        Theme.StylePrimaryButton(btnConfirm);
        btnConfirm.Click += (s, e) => ConfirmAndClose();

        Controls.Add(topBar);
        Controls.Add(lblMessage);
        Controls.Add(lstOptions);
        Controls.Add(btnCancel);
        Controls.Add(btnConfirm);

        AcceptButton = btnConfirm;
        CancelButton = btnCancel;

        topBar.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
        lblTitle.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
    }

    private void ConfirmAndClose()
    {
        SelectedIndex = lstOptions.SelectedIndex;
        DialogResult = SelectedIndex >= 0 ? DialogResult.OK : DialogResult.Cancel;
        Close();
    }

    private void CancelAndClose()
    {
        SelectedIndex = -1;
        DialogResult = DialogResult.Cancel;
        Close();
    }

    /// Shows the list modally; returns the picked option's index, or -1 when
    /// the shop closed it / chose to hold the job.
    public static int Ask(string title, string message, IReadOnlyList<string> options, string confirmLabel = "Print")
    {
        using var form = new ChoicePromptForm(title, message, options, confirmLabel);
        form.ShowDialog();
        return form.SelectedIndex;
    }
}
