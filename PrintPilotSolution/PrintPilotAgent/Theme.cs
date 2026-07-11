using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace PrintPilotAgent;

/// Small shared design-system so every window (main form, cash dialog, etc.)
/// looks like one product instead of stock WinForms grey.
internal static class Theme
{
    public static readonly Color Brand = Color.FromArgb(13, 23, 72);
    public static readonly Color Accent = Color.FromArgb(87, 64, 237);
    public static readonly Color AccentDark = Color.FromArgb(67, 48, 199);
    public static readonly Color Success = Color.FromArgb(22, 163, 108);
    public static readonly Color Danger = Color.FromArgb(199, 48, 75);
    public static readonly Color Muted = Color.FromArgb(89, 101, 140);
    public static readonly Color Soft = Color.FromArgb(245, 247, 252);
    public static readonly Color Border = Color.FromArgb(224, 228, 240);
    public static readonly Color Background = Color.FromArgb(250, 251, 253);

    public static Button PillButton(string text, Color background, Color foreground, int radius = 10)
    {
        var button = new FlatButton
        {
            Text = text,
            Height = 40,
            BackColor = background,
            ForeColor = foreground,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            Cursor = Cursors.Hand,
            Radius = radius,
        };
        button.FlatAppearance.BorderSize = 0;
        return button;
    }

    public static Panel Card()
    {
        return new RoundedPanel
        {
            BackColor = Color.White,
            Padding = new Padding(20),
            Radius = 14,
            BorderColor = Border,
        };
    }
}

/// Flat button with rounded corners via a GraphicsPath region - keeps a
/// modern "pill" look without pulling in a UI library.
internal sealed class FlatButton : Button
{
    public int Radius { get; set; } = 10;

    protected override void OnResize(EventArgs e)
    {
        base.OnResize(e);
        Region = new Region(RoundedRect(ClientRectangle, Radius));
    }

    private static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        var diameter = radius * 2;
        var path = new GraphicsPath();
        if (diameter <= 0 || bounds.Width < diameter || bounds.Height < diameter)
        {
            path.AddRectangle(bounds);
            return path;
        }

        var arc = new Rectangle(bounds.Location, new Size(diameter, diameter));
        path.AddArc(arc, 180, 90);
        arc.X = bounds.Right - diameter;
        path.AddArc(arc, 270, 90);
        arc.Y = bounds.Bottom - diameter;
        path.AddArc(arc, 0, 90);
        arc.X = bounds.Left;
        path.AddArc(arc, 90, 90);
        path.CloseFigure();
        return path;
    }
}

/// A white "card" panel with soft rounded corners and a hairline border,
/// used to group sections (Login, Printer, Logs) on the main window.
internal sealed class RoundedPanel : Panel
{
    public int Radius { get; set; } = 14;
    public Color BorderColor { get; set; } = Theme.Border;

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        var bounds = new Rectangle(0, 0, Width - 1, Height - 1);
        using var path = RoundedRect(bounds, Radius);
        using var pen = new Pen(BorderColor, 1.4f);
        e.Graphics.DrawPath(pen, path);
    }

    protected override void OnResize(EventArgs e)
    {
        base.OnResize(e);
        var bounds = new Rectangle(0, 0, Math.Max(Width, 1), Math.Max(Height, 1));
        Region = new Region(RoundedRect(bounds, Radius));
    }

    private static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        var diameter = radius * 2;
        var path = new GraphicsPath();
        if (diameter <= 0 || bounds.Width < diameter || bounds.Height < diameter)
        {
            path.AddRectangle(bounds);
            return path;
        }

        var arc = new Rectangle(bounds.Location, new Size(diameter, diameter));
        path.AddArc(arc, 180, 90);
        arc.X = bounds.Right - diameter;
        path.AddArc(arc, 270, 90);
        arc.Y = bounds.Bottom - diameter;
        path.AddArc(arc, 0, 90);
        arc.X = bounds.Left;
        path.AddArc(arc, 90, 90);
        path.CloseFigure();
        return path;
    }
}

/// Rounded text box wrapper (WinForms TextBox can't paint its own border,
/// so we sit it inside a rounded panel that draws the border for it).
internal sealed class RoundedTextField : Panel
{
    public TextBox Input { get; }

    public RoundedTextField(bool isPassword = false)
    {
        BackColor = Color.White;
        Padding = new Padding(12, 8, 12, 8);
        Height = 40;
        Input = new TextBox
        {
            BorderStyle = BorderStyle.None,
            Dock = DockStyle.Fill,
            Font = new Font("Segoe UI", 10),
            UseSystemPasswordChar = isPassword,
        };
        Controls.Add(Input);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        var bounds = new Rectangle(0, 0, Width - 1, Height - 1);
        using var path = RoundedRect(bounds, 8);
        using var pen = new Pen(Theme.Border, 1.2f);
        e.Graphics.DrawPath(pen, path);
    }

    protected override void OnResize(EventArgs e)
    {
        base.OnResize(e);
        var bounds = new Rectangle(0, 0, Math.Max(Width, 1), Math.Max(Height, 1));
        Region = new Region(RoundedRect(bounds, 8));
    }

    private static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        var diameter = radius * 2;
        var path = new GraphicsPath();
        if (diameter <= 0 || bounds.Width < diameter || bounds.Height < diameter)
        {
            path.AddRectangle(bounds);
            return path;
        }

        var arc = new Rectangle(bounds.Location, new Size(diameter, diameter));
        path.AddArc(arc, 180, 90);
        arc.X = bounds.Right - diameter;
        path.AddArc(arc, 270, 90);
        arc.Y = bounds.Bottom - diameter;
        path.AddArc(arc, 0, 90);
        arc.X = bounds.Left;
        path.AddArc(arc, 90, 90);
        path.CloseFigure();
        return path;
    }
}
