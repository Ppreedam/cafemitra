namespace Print_Agent
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            pnlTopBar = new Panel();
            btnGear = new Button();
            pictureBox1 = new PictureBox();
            softwareVersion = new Label();
            pnlTopBarBorder = new Panel();
            pnlContent = new Panel();
            pnlPages = new Panel();
            pnlAccount = new Panel();
            pnlLogsCard = new Panel();
            txtAgentLog = new TextBox();
            lblLogsTitle = new Label();
            pnlAccountSpacer = new Panel();
            pnlAccountCard = new Panel();
            lblAccountStatus = new Label();
            btnLogout = new Button();
            btnLogin = new Button();
            txtPassword = new TextBox();
            lblPassword = new Label();
            txtEmail = new TextBox();
            lblEmail = new Label();
            lblWelcomeSub = new Label();
            lblWelcomeTitle = new Label();
            pnlPrint = new Panel();
            dataGridPendingPrintData = new DataGridView();
            pnlPrintToolbar = new FlowLayoutPanel();
            txtFilePath = new TextBox();
            btnBrowse = new Button();
            cmbPageSize = new ComboBox();
            cmbColorType = new ComboBox();
            cmbPrinters = new ComboBox();
            btnPrint = new Button();
            pnlPrintHeader = new Panel();
            lblShopId = new Label();
            label1 = new Label();
            lblPrintPageTitle = new Label();
            pnlHistory = new Panel();
            dataGridCompletedPrintData = new DataGridView();
            lblHistoryPageTitle = new Label();
            pnlSettings = new Panel();
            dataGridPrinterSetting = new DataGridView();
            pnlSettingsSpacer = new Panel();
            pnlSettingsCard = new Panel();
            btnSavePrinterSetting = new Button();
            cBoxSettingPrinter = new ComboBox();
            lblSettingPrinter = new Label();
            cBoxSettingColor = new ComboBox();
            lblSettingColor = new Label();
            cBoxSettingPage = new ComboBox();
            lblSettingPageSize = new Label();
            pnlSettingsHeader = new Panel();
            label2 = new Label();
            btnBackFromSettings = new Button();
            pnlTopBar.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).BeginInit();
            pnlContent.SuspendLayout();
            pnlPages.SuspendLayout();
            pnlAccount.SuspendLayout();
            pnlLogsCard.SuspendLayout();
            pnlAccountCard.SuspendLayout();
            pnlPrint.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridPendingPrintData).BeginInit();
            pnlPrintToolbar.SuspendLayout();
            pnlPrintHeader.SuspendLayout();
            pnlHistory.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridCompletedPrintData).BeginInit();
            pnlSettings.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridPrinterSetting).BeginInit();
            pnlSettingsCard.SuspendLayout();
            pnlSettingsHeader.SuspendLayout();
            SuspendLayout();
            // 
            // pnlTopBar
            // 
            pnlTopBar.BackColor = Color.White;
            pnlTopBar.Controls.Add(btnGear);
            pnlTopBar.Controls.Add(pictureBox1);
            pnlTopBar.Controls.Add(softwareVersion);
            pnlTopBar.Controls.Add(pnlTopBarBorder);
            pnlTopBar.Dock = DockStyle.Top;
            pnlTopBar.Location = new Point(0, 0);
            pnlTopBar.Name = "pnlTopBar";
            pnlTopBar.Size = new Size(404, 64);
            pnlTopBar.TabIndex = 0;
            // 
            // btnGear
            // 
            btnGear.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            btnGear.Location = new Point(348, 10);
            btnGear.Name = "btnGear";
            btnGear.Size = new Size(36, 36);
            btnGear.TabIndex = 2;
            btnGear.Text = "⚙";
            btnGear.UseVisualStyleBackColor = false;
            btnGear.Click += btnGear_Click;
            // 
            // pictureBox1
            // 
            pictureBox1.Image = (Image)resources.GetObject("pictureBox1.Image");
            pictureBox1.Location = new Point(20, 12);
            pictureBox1.Name = "pictureBox1";
            pictureBox1.Size = new Size(150, 40);
            pictureBox1.SizeMode = PictureBoxSizeMode.Zoom;
            pictureBox1.TabIndex = 0;
            pictureBox1.TabStop = false;
            // 
            // softwareVersion
            // 
            softwareVersion.AutoSize = true;
            softwareVersion.Location = new Point(368, 20);
            softwareVersion.Name = "softwareVersion";
            softwareVersion.Size = new Size(15, 17);
            softwareVersion.TabIndex = 1;
            softwareVersion.Text = "9";
            softwareVersion.Visible = false;
            // 
            // pnlTopBarBorder
            // 
            pnlTopBarBorder.BackColor = Color.FromArgb(229, 233, 242);
            pnlTopBarBorder.Dock = DockStyle.Bottom;
            pnlTopBarBorder.Location = new Point(0, 63);
            pnlTopBarBorder.Name = "pnlTopBarBorder";
            pnlTopBarBorder.Size = new Size(404, 1);
            pnlTopBarBorder.TabIndex = 3;
            // 
            // pnlContent
            // 
            pnlContent.BackColor = Color.FromArgb(248, 250, 252);
            pnlContent.Controls.Add(pnlPages);
            pnlContent.Dock = DockStyle.Fill;
            pnlContent.Location = new Point(0, 64);
            pnlContent.Name = "pnlContent";
            pnlContent.Padding = new Padding(20, 16, 20, 16);
            pnlContent.Size = new Size(404, 457);
            pnlContent.TabIndex = 1;
            // 
            // pnlPages
            // 
            pnlPages.Controls.Add(pnlAccount);
            pnlPages.Controls.Add(pnlPrint);
            pnlPages.Controls.Add(pnlHistory);
            pnlPages.Controls.Add(pnlSettings);
            pnlPages.Dock = DockStyle.Fill;
            pnlPages.Location = new Point(20, 16);
            pnlPages.Name = "pnlPages";
            pnlPages.Size = new Size(364, 425);
            pnlPages.TabIndex = 0;
            // 
            // pnlAccount
            // 
            pnlAccount.BackColor = Color.FromArgb(248, 250, 252);
            pnlAccount.Controls.Add(pnlLogsCard);
            pnlAccount.Controls.Add(pnlAccountSpacer);
            pnlAccount.Controls.Add(pnlAccountCard);
            pnlAccount.Dock = DockStyle.Fill;
            pnlAccount.Location = new Point(0, 0);
            pnlAccount.Name = "pnlAccount";
            pnlAccount.Size = new Size(364, 425);
            pnlAccount.TabIndex = 0;
            // 
            // pnlLogsCard
            // 
            pnlLogsCard.BackColor = Color.White;
            pnlLogsCard.Controls.Add(txtAgentLog);
            pnlLogsCard.Controls.Add(lblLogsTitle);
            pnlLogsCard.Dock = DockStyle.Fill;
            pnlLogsCard.Location = new Point(0, 316);
            pnlLogsCard.Name = "pnlLogsCard";
            pnlLogsCard.Padding = new Padding(14, 0, 14, 14);
            pnlLogsCard.Size = new Size(364, 109);
            pnlLogsCard.TabIndex = 2;
            // 
            // txtAgentLog
            // 
            txtAgentLog.BackColor = Color.White;
            txtAgentLog.BorderStyle = BorderStyle.None;
            txtAgentLog.Dock = DockStyle.Fill;
            txtAgentLog.Font = new Font("Consolas", 9F);
            txtAgentLog.ForeColor = Color.FromArgb(71, 85, 105);
            txtAgentLog.Location = new Point(14, 34);
            txtAgentLog.Multiline = true;
            txtAgentLog.Name = "txtAgentLog";
            txtAgentLog.ReadOnly = true;
            txtAgentLog.ScrollBars = ScrollBars.Vertical;
            txtAgentLog.Size = new Size(336, 61);
            txtAgentLog.TabIndex = 1;
            txtAgentLog.TextChanged += txtAgentLog_TextChanged;
            // 
            // lblLogsTitle
            // 
            lblLogsTitle.Dock = DockStyle.Top;
            lblLogsTitle.Font = new Font("Segoe UI Semibold", 9.5F, FontStyle.Bold);
            lblLogsTitle.ForeColor = Color.FromArgb(11, 30, 61);
            lblLogsTitle.Location = new Point(14, 0);
            lblLogsTitle.Name = "lblLogsTitle";
            lblLogsTitle.Size = new Size(336, 34);
            lblLogsTitle.TabIndex = 0;
            lblLogsTitle.Text = "Activity Log";
            lblLogsTitle.TextAlign = ContentAlignment.BottomLeft;
            // 
            // pnlAccountSpacer
            // 
            pnlAccountSpacer.BackColor = Color.FromArgb(248, 250, 252);
            pnlAccountSpacer.Dock = DockStyle.Top;
            pnlAccountSpacer.Location = new Point(0, 300);
            pnlAccountSpacer.Name = "pnlAccountSpacer";
            pnlAccountSpacer.Size = new Size(364, 16);
            pnlAccountSpacer.TabIndex = 1;
            // 
            // pnlAccountCard
            // 
            pnlAccountCard.BackColor = Color.White;
            pnlAccountCard.Controls.Add(lblAccountStatus);
            pnlAccountCard.Controls.Add(btnLogout);
            pnlAccountCard.Controls.Add(btnLogin);
            pnlAccountCard.Controls.Add(txtPassword);
            pnlAccountCard.Controls.Add(lblPassword);
            pnlAccountCard.Controls.Add(txtEmail);
            pnlAccountCard.Controls.Add(lblEmail);
            pnlAccountCard.Controls.Add(lblWelcomeSub);
            pnlAccountCard.Controls.Add(lblWelcomeTitle);
            pnlAccountCard.Dock = DockStyle.Top;
            pnlAccountCard.Location = new Point(0, 0);
            pnlAccountCard.Name = "pnlAccountCard";
            pnlAccountCard.Size = new Size(364, 300);
            pnlAccountCard.TabIndex = 0;
            // 
            // lblAccountStatus
            // 
            lblAccountStatus.AutoSize = true;
            lblAccountStatus.Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold);
            lblAccountStatus.ForeColor = Color.FromArgb(100, 116, 139);
            lblAccountStatus.Location = new Point(24, 254);
            lblAccountStatus.Name = "lblAccountStatus";
            lblAccountStatus.Size = new Size(80, 15);
            lblAccountStatus.TabIndex = 7;
            lblAccountStatus.Text = "Not logged in";
            // 
            // btnLogout
            // 
            btnLogout.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            btnLogout.Location = new Point(240, 244);
            btnLogout.Name = "btnLogout";
            btnLogout.Size = new Size(100, 32);
            btnLogout.TabIndex = 8;
            btnLogout.Text = "Sign Out";
            btnLogout.UseVisualStyleBackColor = false;
            btnLogout.Click += btnLogout_Click;
            // 
            // btnLogin
            // 
            btnLogin.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            btnLogin.Location = new Point(24, 194);
            btnLogin.Name = "btnLogin";
            btnLogin.Size = new Size(316, 40);
            btnLogin.TabIndex = 6;
            btnLogin.Text = "Sign In";
            btnLogin.UseVisualStyleBackColor = false;
            btnLogin.Click += btnLogin_Click;
            // 
            // txtPassword
            // 
            txtPassword.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtPassword.Location = new Point(24, 152);
            txtPassword.Name = "txtPassword";
            txtPassword.PasswordChar = '*';
            txtPassword.Size = new Size(316, 24);
            txtPassword.TabIndex = 5;
            // 
            // lblPassword
            // 
            lblPassword.AutoSize = true;
            lblPassword.Font = new Font("Segoe UI", 9F);
            lblPassword.ForeColor = Color.FromArgb(100, 116, 139);
            lblPassword.Location = new Point(24, 134);
            lblPassword.Name = "lblPassword";
            lblPassword.Size = new Size(57, 15);
            lblPassword.TabIndex = 4;
            lblPassword.Text = "Password";
            // 
            // txtEmail
            // 
            txtEmail.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtEmail.Location = new Point(24, 98);
            txtEmail.Name = "txtEmail";
            txtEmail.Size = new Size(316, 24);
            txtEmail.TabIndex = 3;
            // 
            // lblEmail
            // 
            lblEmail.AutoSize = true;
            lblEmail.Font = new Font("Segoe UI", 9F);
            lblEmail.ForeColor = Color.FromArgb(100, 116, 139);
            lblEmail.Location = new Point(24, 80);
            lblEmail.Name = "lblEmail";
            lblEmail.Size = new Size(81, 15);
            lblEmail.TabIndex = 2;
            lblEmail.Text = "Email Address";
            // 
            // lblWelcomeSub
            // 
            lblWelcomeSub.AutoSize = true;
            lblWelcomeSub.Font = new Font("Segoe UI", 9F);
            lblWelcomeSub.ForeColor = Color.FromArgb(100, 116, 139);
            lblWelcomeSub.Location = new Point(24, 46);
            lblWelcomeSub.Name = "lblWelcomeSub";
            lblWelcomeSub.Size = new Size(153, 15);
            lblWelcomeSub.TabIndex = 1;
            lblWelcomeSub.Text = "Sign in to start printing jobs";
            // 
            // lblWelcomeTitle
            // 
            lblWelcomeTitle.AutoSize = true;
            lblWelcomeTitle.Font = new Font("Segoe UI Semibold", 14F, FontStyle.Bold);
            lblWelcomeTitle.ForeColor = Color.FromArgb(11, 30, 61);
            lblWelcomeTitle.Location = new Point(24, 16);
            lblWelcomeTitle.Name = "lblWelcomeTitle";
            lblWelcomeTitle.Size = new Size(137, 25);
            lblWelcomeTitle.TabIndex = 0;
            lblWelcomeTitle.Text = "Welcome back";
            // 
            // pnlPrint
            // 
            pnlPrint.BackColor = Color.FromArgb(248, 250, 252);
            pnlPrint.Controls.Add(dataGridPendingPrintData);
            pnlPrint.Controls.Add(pnlPrintToolbar);
            pnlPrint.Controls.Add(pnlPrintHeader);
            pnlPrint.Dock = DockStyle.Fill;
            pnlPrint.Location = new Point(0, 0);
            pnlPrint.Name = "pnlPrint";
            pnlPrint.Size = new Size(364, 425);
            pnlPrint.TabIndex = 1;
            pnlPrint.Visible = false;
            // 
            // dataGridPendingPrintData
            // 
            dataGridPendingPrintData.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
            dataGridPendingPrintData.Dock = DockStyle.Fill;
            dataGridPendingPrintData.Location = new Point(0, 74);
            dataGridPendingPrintData.Name = "dataGridPendingPrintData";
            dataGridPendingPrintData.Size = new Size(364, 211);
            dataGridPendingPrintData.TabIndex = 18;
            // 
            // pnlPrintToolbar
            // 
            pnlPrintToolbar.BackColor = Color.White;
            pnlPrintToolbar.Controls.Add(txtFilePath);
            pnlPrintToolbar.Controls.Add(btnBrowse);
            pnlPrintToolbar.Controls.Add(cmbPageSize);
            pnlPrintToolbar.Controls.Add(cmbColorType);
            pnlPrintToolbar.Controls.Add(cmbPrinters);
            pnlPrintToolbar.Controls.Add(btnPrint);
            pnlPrintToolbar.Dock = DockStyle.Bottom;
            pnlPrintToolbar.Location = new Point(0, 285);
            pnlPrintToolbar.Name = "pnlPrintToolbar";
            pnlPrintToolbar.Padding = new Padding(0, 14, 0, 0);
            pnlPrintToolbar.Size = new Size(364, 140);
            pnlPrintToolbar.TabIndex = 17;
            // 
            // txtFilePath
            // 
            txtFilePath.Location = new Point(0, 17);
            txtFilePath.Margin = new Padding(0, 3, 12, 3);
            txtFilePath.Name = "txtFilePath";
            txtFilePath.ReadOnly = true;
            txtFilePath.Size = new Size(260, 24);
            txtFilePath.TabIndex = 13;
            // 
            // btnBrowse
            // 
            btnBrowse.Location = new Point(0, 44);
            btnBrowse.Margin = new Padding(0, 0, 12, 0);
            btnBrowse.Name = "btnBrowse";
            btnBrowse.Size = new Size(100, 34);
            btnBrowse.TabIndex = 17;
            btnBrowse.Text = "Browse";
            btnBrowse.UseVisualStyleBackColor = false;
            btnBrowse.Click += btnBrowse_Click;
            // 
            // cmbPageSize
            // 
            cmbPageSize.FormattingEnabled = true;
            cmbPageSize.Location = new Point(112, 47);
            cmbPageSize.Margin = new Padding(0, 3, 12, 3);
            cmbPageSize.Name = "cmbPageSize";
            cmbPageSize.Size = new Size(100, 25);
            cmbPageSize.TabIndex = 14;
            // 
            // cmbColorType
            // 
            cmbColorType.FormattingEnabled = true;
            cmbColorType.Location = new Point(224, 47);
            cmbColorType.Margin = new Padding(0, 3, 12, 3);
            cmbColorType.Name = "cmbColorType";
            cmbColorType.Size = new Size(110, 25);
            cmbColorType.TabIndex = 15;
            // 
            // cmbPrinters
            // 
            cmbPrinters.FormattingEnabled = true;
            cmbPrinters.Location = new Point(0, 81);
            cmbPrinters.Margin = new Padding(0, 3, 12, 3);
            cmbPrinters.Name = "cmbPrinters";
            cmbPrinters.Size = new Size(150, 25);
            cmbPrinters.TabIndex = 12;
            // 
            // btnPrint
            // 
            btnPrint.Location = new Point(162, 78);
            btnPrint.Margin = new Padding(0);
            btnPrint.Name = "btnPrint";
            btnPrint.Size = new Size(110, 34);
            btnPrint.TabIndex = 16;
            btnPrint.Text = "Print";
            btnPrint.Click += btnPrint_Click;
            // 
            // pnlPrintHeader
            // 
            pnlPrintHeader.Controls.Add(lblShopId);
            pnlPrintHeader.Controls.Add(label1);
            pnlPrintHeader.Controls.Add(lblPrintPageTitle);
            pnlPrintHeader.Dock = DockStyle.Top;
            pnlPrintHeader.Location = new Point(0, 0);
            pnlPrintHeader.Name = "pnlPrintHeader";
            pnlPrintHeader.Size = new Size(364, 74);
            pnlPrintHeader.TabIndex = 0;
            // 
            // lblShopId
            // 
            lblShopId.AutoSize = true;
            lblShopId.Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold);
            lblShopId.ForeColor = Color.FromArgb(100, 116, 139);
            lblShopId.Location = new Point(84, 50);
            lblShopId.Name = "lblShopId";
            lblShopId.Size = new Size(14, 15);
            lblShopId.TabIndex = 19;
            lblShopId.Text = "5";
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Font = new Font("Segoe UI", 9F);
            label1.ForeColor = Color.FromArgb(100, 116, 139);
            label1.Location = new Point(3, 50);
            label1.Name = "label1";
            label1.Size = new Size(53, 15);
            label1.TabIndex = 20;
            label1.Text = "Shop Id :";
            // 
            // lblPrintPageTitle
            // 
            lblPrintPageTitle.Dock = DockStyle.Top;
            lblPrintPageTitle.Font = new Font("Segoe UI Semibold", 14F, FontStyle.Bold);
            lblPrintPageTitle.ForeColor = Color.FromArgb(11, 30, 61);
            lblPrintPageTitle.Location = new Point(0, 0);
            lblPrintPageTitle.Name = "lblPrintPageTitle";
            lblPrintPageTitle.Size = new Size(364, 44);
            lblPrintPageTitle.TabIndex = 0;
            lblPrintPageTitle.Text = "Print";
            lblPrintPageTitle.TextAlign = ContentAlignment.BottomLeft;
            // 
            // pnlHistory
            // 
            pnlHistory.BackColor = Color.FromArgb(248, 250, 252);
            pnlHistory.Controls.Add(dataGridCompletedPrintData);
            pnlHistory.Controls.Add(lblHistoryPageTitle);
            pnlHistory.Dock = DockStyle.Fill;
            pnlHistory.Location = new Point(0, 0);
            pnlHistory.Name = "pnlHistory";
            pnlHistory.Size = new Size(364, 425);
            pnlHistory.TabIndex = 2;
            pnlHistory.Visible = false;
            // 
            // dataGridCompletedPrintData
            // 
            dataGridCompletedPrintData.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
            dataGridCompletedPrintData.Dock = DockStyle.Fill;
            dataGridCompletedPrintData.Location = new Point(0, 44);
            dataGridCompletedPrintData.Name = "dataGridCompletedPrintData";
            dataGridCompletedPrintData.Size = new Size(364, 381);
            dataGridCompletedPrintData.TabIndex = 0;
            // 
            // lblHistoryPageTitle
            // 
            lblHistoryPageTitle.Dock = DockStyle.Top;
            lblHistoryPageTitle.Font = new Font("Segoe UI Semibold", 14F, FontStyle.Bold);
            lblHistoryPageTitle.ForeColor = Color.FromArgb(11, 30, 61);
            lblHistoryPageTitle.Location = new Point(0, 0);
            lblHistoryPageTitle.Name = "lblHistoryPageTitle";
            lblHistoryPageTitle.Size = new Size(364, 44);
            lblHistoryPageTitle.TabIndex = 1;
            lblHistoryPageTitle.Text = "Print History";
            lblHistoryPageTitle.TextAlign = ContentAlignment.BottomLeft;
            // 
            // pnlSettings
            // 
            pnlSettings.BackColor = Color.FromArgb(248, 250, 252);
            pnlSettings.Controls.Add(dataGridPrinterSetting);
            pnlSettings.Controls.Add(pnlSettingsSpacer);
            pnlSettings.Controls.Add(pnlSettingsCard);
            pnlSettings.Controls.Add(pnlSettingsHeader);
            pnlSettings.Dock = DockStyle.Fill;
            pnlSettings.Location = new Point(0, 0);
            pnlSettings.Name = "pnlSettings";
            pnlSettings.Size = new Size(364, 425);
            pnlSettings.TabIndex = 3;
            pnlSettings.Visible = false;
            // 
            // dataGridPrinterSetting
            // 
            dataGridPrinterSetting.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
            dataGridPrinterSetting.Dock = DockStyle.Fill;
            dataGridPrinterSetting.Location = new Point(0, 324);
            dataGridPrinterSetting.Name = "dataGridPrinterSetting";
            dataGridPrinterSetting.Size = new Size(364, 101);
            dataGridPrinterSetting.TabIndex = 3;
            dataGridPrinterSetting.CellContentClick += dataGridPrinterSetting_CellContentClick;
            // 
            // pnlSettingsSpacer
            // 
            pnlSettingsSpacer.BackColor = Color.FromArgb(248, 250, 252);
            pnlSettingsSpacer.Dock = DockStyle.Top;
            pnlSettingsSpacer.Location = new Point(0, 310);
            pnlSettingsSpacer.Name = "pnlSettingsSpacer";
            pnlSettingsSpacer.Size = new Size(364, 14);
            pnlSettingsSpacer.TabIndex = 2;
            // 
            // pnlSettingsCard
            // 
            pnlSettingsCard.BackColor = Color.White;
            pnlSettingsCard.Controls.Add(btnSavePrinterSetting);
            pnlSettingsCard.Controls.Add(cBoxSettingPrinter);
            pnlSettingsCard.Controls.Add(lblSettingPrinter);
            pnlSettingsCard.Controls.Add(cBoxSettingColor);
            pnlSettingsCard.Controls.Add(lblSettingColor);
            pnlSettingsCard.Controls.Add(cBoxSettingPage);
            pnlSettingsCard.Controls.Add(lblSettingPageSize);
            pnlSettingsCard.Dock = DockStyle.Top;
            pnlSettingsCard.Location = new Point(0, 54);
            pnlSettingsCard.Name = "pnlSettingsCard";
            pnlSettingsCard.Size = new Size(364, 256);
            pnlSettingsCard.TabIndex = 1;
            // 
            // btnSavePrinterSetting
            // 
            btnSavePrinterSetting.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            btnSavePrinterSetting.Location = new Point(24, 200);
            btnSavePrinterSetting.Name = "btnSavePrinterSetting";
            btnSavePrinterSetting.Size = new Size(316, 40);
            btnSavePrinterSetting.TabIndex = 6;
            btnSavePrinterSetting.Text = "Save Preset";
            btnSavePrinterSetting.UseVisualStyleBackColor = false;
            btnSavePrinterSetting.Click += btnSavePrinterSetting_Click;
            // 
            // cBoxSettingPrinter
            // 
            cBoxSettingPrinter.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            cBoxSettingPrinter.FormattingEnabled = true;
            cBoxSettingPrinter.Location = new Point(24, 158);
            cBoxSettingPrinter.Name = "cBoxSettingPrinter";
            cBoxSettingPrinter.Size = new Size(316, 25);
            cBoxSettingPrinter.TabIndex = 5;
            // 
            // lblSettingPrinter
            // 
            lblSettingPrinter.AutoSize = true;
            lblSettingPrinter.Font = new Font("Segoe UI", 9F);
            lblSettingPrinter.ForeColor = Color.FromArgb(100, 116, 139);
            lblSettingPrinter.Location = new Point(24, 140);
            lblSettingPrinter.Name = "lblSettingPrinter";
            lblSettingPrinter.Size = new Size(42, 15);
            lblSettingPrinter.TabIndex = 4;
            lblSettingPrinter.Text = "Printer";
            // 
            // cBoxSettingColor
            // 
            cBoxSettingColor.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            cBoxSettingColor.FormattingEnabled = true;
            cBoxSettingColor.Location = new Point(24, 96);
            cBoxSettingColor.Name = "cBoxSettingColor";
            cBoxSettingColor.Size = new Size(316, 25);
            cBoxSettingColor.TabIndex = 3;
            // 
            // lblSettingColor
            // 
            lblSettingColor.AutoSize = true;
            lblSettingColor.Font = new Font("Segoe UI", 9F);
            lblSettingColor.ForeColor = Color.FromArgb(100, 116, 139);
            lblSettingColor.Location = new Point(24, 78);
            lblSettingColor.Name = "lblSettingColor";
            lblSettingColor.Size = new Size(70, 15);
            lblSettingColor.TabIndex = 2;
            lblSettingColor.Text = "Color Mode";
            // 
            // cBoxSettingPage
            // 
            cBoxSettingPage.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            cBoxSettingPage.FormattingEnabled = true;
            cBoxSettingPage.Location = new Point(24, 34);
            cBoxSettingPage.Name = "cBoxSettingPage";
            cBoxSettingPage.Size = new Size(316, 25);
            cBoxSettingPage.TabIndex = 1;
            cBoxSettingPage.SelectedIndexChanged += cBoxSettingPage_SelectedIndexChanged;
            // 
            // lblSettingPageSize
            // 
            lblSettingPageSize.AutoSize = true;
            lblSettingPageSize.Font = new Font("Segoe UI", 9F);
            lblSettingPageSize.ForeColor = Color.FromArgb(100, 116, 139);
            lblSettingPageSize.Location = new Point(24, 16);
            lblSettingPageSize.Name = "lblSettingPageSize";
            lblSettingPageSize.Size = new Size(60, 15);
            lblSettingPageSize.TabIndex = 0;
            lblSettingPageSize.Text = "Paper Size";
            // 
            // pnlSettingsHeader
            // 
            pnlSettingsHeader.Controls.Add(label2);
            pnlSettingsHeader.Controls.Add(btnBackFromSettings);
            pnlSettingsHeader.Dock = DockStyle.Top;
            pnlSettingsHeader.Location = new Point(0, 0);
            pnlSettingsHeader.Name = "pnlSettingsHeader";
            pnlSettingsHeader.Size = new Size(364, 54);
            pnlSettingsHeader.TabIndex = 0;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Font = new Font("Segoe UI Semibold", 14F, FontStyle.Bold);
            label2.ForeColor = Color.FromArgb(11, 30, 61);
            label2.Location = new Point(92, 13);
            label2.Name = "label2";
            label2.Size = new Size(124, 25);
            label2.TabIndex = 1;
            label2.Text = "Printer Setup";
            // 
            // btnBackFromSettings
            // 
            btnBackFromSettings.Location = new Point(0, 10);
            btnBackFromSettings.Name = "btnBackFromSettings";
            btnBackFromSettings.Size = new Size(80, 34);
            btnBackFromSettings.TabIndex = 0;
            btnBackFromSettings.Text = "← Back";
            btnBackFromSettings.UseVisualStyleBackColor = false;
            btnBackFromSettings.Click += btnBackFromSettings_Click;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 17F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.FromArgb(248, 250, 252);
            ClientSize = new Size(404, 521);
            Controls.Add(pnlContent);
            Controls.Add(pnlTopBar);
            Font = new Font("Segoe UI", 9.5F);
            Icon = (Icon)resources.GetObject("$this.Icon");
            MaximizeBox = false;
            MaximumSize = new Size(420, 560);
            MinimumSize = new Size(420, 560);
            Name = "Form1";
            Text = "RepetiGo Print Agent";
            Load += Form1_Load;
            pnlTopBar.ResumeLayout(false);
            pnlTopBar.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).EndInit();
            pnlContent.ResumeLayout(false);
            pnlPages.ResumeLayout(false);
            pnlAccount.ResumeLayout(false);
            pnlLogsCard.ResumeLayout(false);
            pnlLogsCard.PerformLayout();
            pnlAccountCard.ResumeLayout(false);
            pnlAccountCard.PerformLayout();
            pnlPrint.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)dataGridPendingPrintData).EndInit();
            pnlPrintToolbar.ResumeLayout(false);
            pnlPrintToolbar.PerformLayout();
            pnlPrintHeader.ResumeLayout(false);
            pnlPrintHeader.PerformLayout();
            pnlHistory.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)dataGridCompletedPrintData).EndInit();
            pnlSettings.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)dataGridPrinterSetting).EndInit();
            pnlSettingsCard.ResumeLayout(false);
            pnlSettingsCard.PerformLayout();
            pnlSettingsHeader.ResumeLayout(false);
            pnlSettingsHeader.PerformLayout();
            ResumeLayout(false);
        }

        #endregion

        private Panel pnlTopBar;
        private Panel pnlTopBarBorder;
        private Button btnGear;
        private Panel pnlContent;
        private Panel pnlPages;

        private Panel pnlAccount;
        private Panel pnlAccountCard;
        private Label lblWelcomeTitle;
        private Label lblWelcomeSub;
        private Label lblEmail;
        private TextBox txtEmail;
        private Label lblPassword;
        private TextBox txtPassword;
        private Button btnLogin;
        private Button btnLogout;
        private Label lblAccountStatus;
        private Panel pnlAccountSpacer;
        private Panel pnlLogsCard;
        private Label lblLogsTitle;
        private TextBox txtAgentLog;

        private Panel pnlPrint;
        private Panel pnlPrintHeader;
        private Label lblPrintPageTitle;
        private Label label1;
        private Label lblShopId;
        private DataGridView dataGridPendingPrintData;
        private FlowLayoutPanel pnlPrintToolbar;
        private TextBox txtFilePath;
        private Button btnBrowse;
        private ComboBox cmbPageSize;
        private ComboBox cmbColorType;
        private ComboBox cmbPrinters;
        private Button btnPrint;

        private Panel pnlHistory;
        private Label lblHistoryPageTitle;
        private DataGridView dataGridCompletedPrintData;

        private Panel pnlSettings;
        private Panel pnlSettingsHeader;
        private Button btnBackFromSettings;
        private Label label2;
        private Panel pnlSettingsCard;
        private Panel pnlSettingsSpacer;
        private Label lblSettingPageSize;
        private ComboBox cBoxSettingPage;
        private Label lblSettingColor;
        private ComboBox cBoxSettingColor;
        private Label lblSettingPrinter;
        private ComboBox cBoxSettingPrinter;
        private Button btnSavePrinterSetting;
        private DataGridView dataGridPrinterSetting;

        private Label softwareVersion;
        private PictureBox pictureBox1;
    }
}
