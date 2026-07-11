using System.Drawing;
using System.Windows.Forms;

namespace PrintPilotAgent;

internal sealed class CashApprovalDialog : Form
{
    public CashApprovalDialog(PrintJob job)
    {
        Text = "PrintPilot";
        ClientSize = new Size(540, 420);
        MinimumSize = new Size(520, 430);
        StartPosition = FormStartPosition.Manual;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        ShowInTaskbar = true;
        TopMost = true;
        Font = new Font("Segoe UI", 10);
        BackColor = Color.White;

        var brand = Theme.Brand;
        var accent = Theme.Accent;
        var soft = Theme.Soft;
        var muted = Theme.Muted;

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(24),
            ColumnCount = 1,
            RowCount = 6,
        };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 108));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 52));
        Controls.Add(root);

        root.Controls.Add(new Label
        {
            Text = "CafeMitra",
            AutoSize = true,
            Font = new Font("Segoe UI", 20, FontStyle.Bold),
            ForeColor = brand,
        });

        root.Controls.Add(new Label
        {
            Text = "Cash counter print request",
            AutoSize = true,
            Font = new Font("Segoe UI", 11, FontStyle.Bold),
            ForeColor = accent,
            Padding = new Padding(0, 0, 0, 4),
        });

        root.Controls.Add(new Label
        {
            Text = $"Customer se Rs. {job.TotalAmount:0.##} cash payment collect karke hi print confirm karein.",
            AutoSize = true,
            MaximumSize = new Size(460, 0),
            ForeColor = muted,
            Padding = new Padding(0, 0, 0, 10),
        });

        var details = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = soft,
            Padding = new Padding(16),
        };
        root.Controls.Add(details);

        details.Controls.Add(new Label
        {
            Dock = DockStyle.Fill,
            ForeColor = brand,
            Font = new Font("Segoe UI", 10, FontStyle.Bold),
            Text =
                $"{DisplayToken(job)}\n" +
                $"{DisplayFile(job)}\n" +
                $"{job.Pages} x {job.Copies} page(s) | {job.PrintColorModeLabel} | Rs. {job.TotalAmount:0.##}",
        });

        root.Controls.Add(new Label
        {
            Text = "Payment received? Ready to print this page now?",
            AutoSize = true,
            MaximumSize = new Size(460, 0),
            ForeColor = muted,
            Padding = new Padding(0, 14, 0, 8),
        });

        var actions = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.RightToLeft,
            WrapContents = false,
            Padding = new Padding(0, 4, 0, 0),
        };
        root.Controls.Add(actions);

        var yes = Theme.PillButton("Yes, print", accent, Color.White);
        yes.DialogResult = DialogResult.OK;
        yes.Width = 118;

        var no = Theme.PillButton("Not now", Color.FromArgb(252, 233, 237), Color.FromArgb(199, 48, 75));
        no.DialogResult = DialogResult.No;
        no.Width = 102;

        actions.Controls.Add(yes);
        actions.Controls.Add(no);
    }

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        var screen = Screen.FromPoint(Cursor.Position).WorkingArea;
        Location = new Point(
            screen.Left + (screen.Width - Width) / 2,
            screen.Top + (screen.Height - Height) / 2
        );
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        WindowState = FormWindowState.Normal;
        BringToFront();
        Activate();
    }

    private static string DisplayToken(PrintJob job) => string.IsNullOrWhiteSpace(job.TokenId) ? $"Order {job.Id}" : job.TokenId;
    private static string DisplayFile(PrintJob job) => string.IsNullOrWhiteSpace(job.FileName) ? job.OrderNumber : job.FileName;
}
