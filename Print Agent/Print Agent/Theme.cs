using System.Drawing.Drawing2D;

namespace Print_Agent;

internal static class Theme
{
    // Brand palette: Deep Navy / Primary Blue / Teal / Blue-to-Teal gradient.
    public static readonly Color DeepNavy = ColorTranslator.FromHtml("#0B1E3D");
    public static readonly Color Primary = ColorTranslator.FromHtml("#2563EB");
    public static readonly Color PrimaryDark = ColorTranslator.FromHtml("#1D4ED8");
    public static readonly Color PrimaryTint = ColorTranslator.FromHtml("#EFF6FF");
    public static readonly Color Teal = ColorTranslator.FromHtml("#14B8A6");
    public static readonly Color TealDark = ColorTranslator.FromHtml("#0F9488");

    public static readonly Color SidebarBg = Color.White;
    public static readonly Color SidebarBorder = ColorTranslator.FromHtml("#E5E9F2");
    public static readonly Color SidebarBgActive = ColorTranslator.FromHtml("#EFF6FF");
    public static readonly Color SidebarBgHover = ColorTranslator.FromHtml("#F4F6FB");
    public static readonly Color SidebarText = ColorTranslator.FromHtml("#55607A");
    public static readonly Color SidebarTextActive = Primary;
    public static readonly Color PageBg = ColorTranslator.FromHtml("#F8FAFC");
    public static readonly Color CardBg = Color.White;
    public static readonly Color Border = ColorTranslator.FromHtml("#E2E8F0");
    public static readonly Color TextPrimary = DeepNavy;
    public static readonly Color TextMuted = ColorTranslator.FromHtml("#64748B");
    public static readonly Color Success = Teal;
    public static readonly Color Danger = ColorTranslator.FromHtml("#DC2626");
    public static readonly Color GridHeaderBg = ColorTranslator.FromHtml("#F1F5F9");
    public static readonly Color GridAltRow = ColorTranslator.FromHtml("#F8FAFC");

    public static readonly Font FontBrand = new Font("Segoe UI Semibold", 15F, FontStyle.Bold);
    public static readonly Font FontBrandSub = new Font("Segoe UI", 8.5F, FontStyle.Regular);
    public static readonly Font FontPageTitle = new Font("Segoe UI Semibold", 14F, FontStyle.Bold);
    public static readonly Font FontLabel = new Font("Segoe UI", 9F, FontStyle.Regular);
    public static readonly Font FontLabelBold = new Font("Segoe UI Semibold", 9F, FontStyle.Bold);
    public static readonly Font FontBody = new Font("Segoe UI", 9.5F, FontStyle.Regular);
    public static readonly Font FontNav = new Font("Segoe UI", 10F, FontStyle.Regular);
    public static readonly Font FontMono = new Font("Consolas", 9F, FontStyle.Regular);

    public static void StylePrimaryButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 0;
        b.BackColor = Primary;
        b.ForeColor = Color.White;
        b.Font = FontLabelBold;
        b.Cursor = Cursors.Hand;
        b.Height = 34;
        b.FlatAppearance.MouseOverBackColor = PrimaryDark;
        b.FlatAppearance.MouseDownBackColor = PrimaryDark;
    }

    /// <summary>Brand gradient CTA (Primary blue → Teal, matching the
    /// "RepetiGo" wordmark's own navy-to-teal coloring), rounded corners.
    /// Reserved for the single primary action on a screen (e.g. Sign In) -
    /// using it for everything would make nothing stand out.</summary>
    public static void StyleBrandButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 0;
        b.BackColor = Primary;
        b.ForeColor = Color.White;
        b.Font = new Font("Segoe UI Semibold", 10.5F, FontStyle.Bold);
        b.Cursor = Cursors.Hand;
        b.Height = 42;

        var hovered = false;
        b.MouseEnter += (s, e) => { hovered = true; b.Invalidate(); };
        b.MouseLeave += (s, e) => { hovered = false; b.Invalidate(); };
        b.EnabledChanged += (s, e) =>
        {
            b.Cursor = b.Enabled ? Cursors.Hand : Cursors.Default;
            b.Invalidate();
        };

        void ApplyRoundedRegion(object s, EventArgs e)
        {
            if (b.Width <= 0 || b.Height <= 0) return;
            var radius = Math.Min(b.Height / 2, 14);
            var d = radius * 2;
            var rect = new Rectangle(0, 0, b.Width, b.Height);
            var path = new GraphicsPath();
            path.AddArc(rect.X, rect.Y, d, d, 180, 90);
            path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
            path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
            path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
            path.CloseFigure();
            b.Region = new Region(path);
        }
        b.Resize += ApplyRoundedRegion;
        ApplyRoundedRegion(b, EventArgs.Empty);

        b.Paint += (s, e) =>
        {
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;

            if (!b.Enabled)
            {
                // Muted flat gray while waiting for input (or, combined with
                // btnLogin_Click's own Enabled=false, while a login request
                // is in flight) - visually distinct from the brand gradient
                // so "not clickable right now" reads clearly.
                using var disabledBrush = new SolidBrush(ColorTranslator.FromHtml("#CBD5E1"));
                e.Graphics.FillRectangle(disabledBrush, b.ClientRectangle);
                TextRenderer.DrawText(
                    e.Graphics, b.Text, b.Font, b.ClientRectangle, ColorTranslator.FromHtml("#64748B"),
                    TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter
                );
                return;
            }

            var startColor = hovered ? PrimaryDark : Primary;
            var endColor = hovered ? TealDark : Teal;
            using var brush = new LinearGradientBrush(new Rectangle(0, 0, Math.Max(b.Width, 1), Math.Max(b.Height, 1)), startColor, endColor, LinearGradientMode.Horizontal);
            e.Graphics.FillRectangle(brush, b.ClientRectangle);
            TextRenderer.DrawText(
                e.Graphics, b.Text, b.Font, b.ClientRectangle, Color.White,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter
            );
        };
    }

    public static void StyleSecondaryButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 1;
        b.FlatAppearance.BorderColor = Border;
        b.BackColor = Color.White;
        b.ForeColor = TextPrimary;
        b.Font = FontLabelBold;
        b.Cursor = Cursors.Hand;
        b.Height = 34;
        b.FlatAppearance.MouseOverBackColor = ColorTranslator.FromHtml("#F1F5F9");
    }

    public static void StyleNavButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 0;
        b.BackColor = SidebarBg;
        b.ForeColor = SidebarText;
        b.Font = FontNav;
        b.TextAlign = ContentAlignment.MiddleLeft;
        b.Padding = new Padding(18, 0, 0, 0);
        b.Height = 42;
        b.Cursor = Cursors.Hand;
        b.FlatAppearance.MouseOverBackColor = SidebarBgHover;
        b.FlatAppearance.MouseDownBackColor = SidebarBgActive;
    }

    public static void SetNavActive(Button b, bool active)
    {
        b.BackColor = active ? SidebarBgActive : SidebarBg;
        b.ForeColor = active ? SidebarTextActive : SidebarText;
        b.Font = active ? FontLabelBold : FontNav;
    }

    public static void StyleTextBox(TextBox t)
    {
        t.BorderStyle = BorderStyle.FixedSingle;
        t.Font = FontBody;
        t.BackColor = Color.White;
        // Subtle teal-tint on focus - small branded touch, no layout impact.
        t.Enter += (s, e) => t.BackColor = ColorTranslator.FromHtml("#F0FDFA");
        t.Leave += (s, e) => t.BackColor = Color.White;
    }

    public static void StyleCombo(ComboBox c)
    {
        c.FlatStyle = FlatStyle.Flat;
        c.Font = FontBody;
        c.DropDownStyle = ComboBoxStyle.DropDownList;
    }

    public static void StyleGrid(DataGridView g)
    {
        g.BorderStyle = BorderStyle.None;
        g.BackgroundColor = CardBg;
        g.GridColor = Border;
        g.EnableHeadersVisualStyles = false;
        g.RowHeadersVisible = false;
        g.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
        g.ColumnHeadersHeight = 36;
        g.ColumnHeadersDefaultCellStyle.BackColor = GridHeaderBg;
        g.ColumnHeadersDefaultCellStyle.ForeColor = TextPrimary;
        g.ColumnHeadersDefaultCellStyle.Font = FontLabelBold;
        g.ColumnHeadersDefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleLeft;
        g.ColumnHeadersDefaultCellStyle.Padding = new Padding(6, 0, 0, 0);
        g.DefaultCellStyle.BackColor = CardBg;
        g.DefaultCellStyle.ForeColor = TextPrimary;
        g.DefaultCellStyle.SelectionBackColor = ColorTranslator.FromHtml("#DCE9FE");
        g.DefaultCellStyle.SelectionForeColor = TextPrimary;
        g.DefaultCellStyle.Font = FontBody;
        g.DefaultCellStyle.Padding = new Padding(4, 4, 4, 4);
        g.AlternatingRowsDefaultCellStyle.BackColor = GridAltRow;
        g.RowTemplate.Height = 32;
        g.CellBorderStyle = DataGridViewCellBorderStyle.SingleHorizontal;
        g.AllowUserToResizeRows = false;
    }

    public static Panel MakeCard(int padding = 20)
    {
        var p = new Panel
        {
            BackColor = CardBg,
            Padding = new Padding(padding),
        };
        p.Paint += (s, e) =>
        {
            using var pen = new Pen(Border);
            var rect = new Rectangle(0, 0, p.Width - 1, p.Height - 1);
            e.Graphics.DrawRectangle(pen, rect);
        };
        return p;
    }

    /// <summary>Gives an existing panel a white background with a soft rounded outline - used for the account/log/settings cards.</summary>
    public static void StyleRoundedCard(Panel p, int radius = 12)
    {
        p.BackColor = CardBg;
        p.Paint += (s, e) =>
        {
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            var rect = new Rectangle(0, 0, p.Width - 1, p.Height - 1);
            using var path = RoundedRect(rect, radius);
            using var pen = new Pen(Border);
            e.Graphics.DrawPath(pen, path);
        };
    }

    private static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        int d = radius * 2;
        var path = new GraphicsPath();
        path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
        path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
        path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
        path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }

    /// <summary>Small round icon button (e.g. the printer-setup gear) tucked in a corner of the page.</summary>
    public static void StyleIconButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 1;
        b.FlatAppearance.BorderColor = Border;
        b.BackColor = Color.White;
        b.ForeColor = TextMuted;
        b.Font = new Font("Segoe UI", 13F);
        b.Cursor = Cursors.Hand;
        b.TextAlign = ContentAlignment.MiddleCenter;
        b.FlatAppearance.MouseOverBackColor = PrimaryTint;
        b.FlatAppearance.MouseDownBackColor = PrimaryTint;

        var path = new GraphicsPath();
        path.AddEllipse(0, 0, b.Width, b.Height);
        b.Region = new Region(path);
    }

    /// <summary>Muted, borderless "text button" - used for Sign Out and Back links.</summary>
    public static void StyleTextButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 0;
        b.BackColor = Color.Transparent;
        b.ForeColor = TextMuted;
        b.Font = FontLabelBold;
        b.Cursor = Cursors.Hand;
        b.TextAlign = ContentAlignment.MiddleCenter;
        b.FlatAppearance.MouseOverBackColor = ColorTranslator.FromHtml("#F1F5F9");
    }

    /// <summary>Brand-colored "← Back" link - like StyleTextButton but tinted Primary blue so it reads as a navigation action, not a muted/disabled one.</summary>
    public static void StyleBackButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 0;
        b.BackColor = Color.Transparent;
        b.ForeColor = Primary;
        b.Font = FontLabelBold;
        b.Cursor = Cursors.Hand;
        b.TextAlign = ContentAlignment.MiddleCenter;
        b.FlatAppearance.MouseOverBackColor = PrimaryTint;
        b.FlatAppearance.MouseDownBackColor = PrimaryTint;
    }

    /// <summary>Small red-outline button - used for Sign Out, where a plain muted text link was easy to miss/mistake for disabled.</summary>
    public static void StyleDangerOutlineButton(Button b)
    {
        b.FlatStyle = FlatStyle.Flat;
        b.FlatAppearance.BorderSize = 1;
        b.FlatAppearance.BorderColor = Danger;
        b.BackColor = Color.White;
        b.ForeColor = Danger;
        b.Font = FontLabelBold;
        b.Cursor = Cursors.Hand;
        b.TextAlign = ContentAlignment.MiddleCenter;
        b.FlatAppearance.MouseOverBackColor = ColorTranslator.FromHtml("#FEF2F2");
        b.FlatAppearance.MouseDownBackColor = ColorTranslator.FromHtml("#FEE2E2");
    }
}
