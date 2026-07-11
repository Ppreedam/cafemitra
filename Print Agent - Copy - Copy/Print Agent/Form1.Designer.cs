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
            trayMenu = new ContextMenuStrip(components);
            openMenuItem = new ToolStripMenuItem();
            exitMenuItem = new ToolStripMenuItem();
            trayIcon = new NotifyIcon(components);
            tabControl1 = new TabControl();
            tabPageAccount = new TabPage();
            version = new Label();
            lblEmail = new Label();
            txtEmail = new TextBox();
            lblPassword = new Label();
            txtPassword = new TextBox();
            btnLogin = new Button();
            btnLogout = new Button();
            lblAccountStatus = new Label();
            lblLogTitle = new Label();
            txtAgentLog = new TextBox();
            tabPage1 = new TabPage();
            label1 = new Label();
            lblShopId = new Label();
            dataGridPendingPrintData = new DataGridView();
            btnBrowse = new Button();
            btnPrint = new Button();
            cmbPrinters = new ComboBox();
            cmbColorType = new ComboBox();
            cmbPageSize = new ComboBox();
            txtFilePath = new TextBox();
            tabPage2 = new TabPage();
            dataGridCompletedPrintData = new DataGridView();
            tabPage3 = new TabPage();
            dataGridPrinterSetting = new DataGridView();
            btnSavePrinterSetting = new Button();
            cBoxSettingPrinter = new ComboBox();
            cBoxSettingColor = new ComboBox();
            cBoxSettingPage = new ComboBox();
            label2 = new Label();
            close = new Label();
            trayMenu.SuspendLayout();
            tabControl1.SuspendLayout();
            tabPageAccount.SuspendLayout();
            tabPage1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridPendingPrintData).BeginInit();
            tabPage2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridCompletedPrintData).BeginInit();
            tabPage3.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridPrinterSetting).BeginInit();
            SuspendLayout();
            //
            // trayMenu
            //
            trayMenu.Items.AddRange(new ToolStripItem[] { openMenuItem, exitMenuItem });
            trayMenu.Name = "trayMenu";
            trayMenu.Size = new Size(150, 48);
            //
            // openMenuItem
            //
            openMenuItem.Name = "openMenuItem";
            openMenuItem.Text = "Open Print Agent";
            openMenuItem.Click += openMenuItem_Click;
            //
            // exitMenuItem
            //
            exitMenuItem.Name = "exitMenuItem";
            exitMenuItem.Text = "Exit";
            exitMenuItem.Click += exitMenuItem_Click;
            //
            // trayIcon
            //
            trayIcon.Icon = SystemIcons.Application;
            trayIcon.Text = "Print Agent";
            trayIcon.Visible = true;
            trayIcon.ContextMenuStrip = trayMenu;
            trayIcon.DoubleClick += trayIcon_DoubleClick;
            //
            // tabControl1
            //
            tabControl1.Controls.Add(tabPageAccount);
            tabControl1.Controls.Add(tabPage1);
            tabControl1.Controls.Add(tabPage2);
            tabControl1.Controls.Add(tabPage3);
            tabControl1.Location = new Point(1, 28);
            tabControl1.Name = "tabControl1";
            tabControl1.SelectedIndex = 0;
            tabControl1.Size = new Size(484, 328);
            tabControl1.TabIndex = 6;
            // 
            // tabPageAccount
            // 
            tabPageAccount.Controls.Add(version);
            tabPageAccount.Controls.Add(lblEmail);
            tabPageAccount.Controls.Add(txtEmail);
            tabPageAccount.Controls.Add(lblPassword);
            tabPageAccount.Controls.Add(txtPassword);
            tabPageAccount.Controls.Add(btnLogin);
            tabPageAccount.Controls.Add(btnLogout);
            tabPageAccount.Controls.Add(lblAccountStatus);
            tabPageAccount.Controls.Add(lblLogTitle);
            tabPageAccount.Controls.Add(txtAgentLog);
            tabPageAccount.Location = new Point(4, 24);
            tabPageAccount.Name = "tabPageAccount";
            tabPageAccount.Padding = new Padding(3);
            tabPageAccount.Size = new Size(476, 300);
            tabPageAccount.TabIndex = 3;
            tabPageAccount.Text = "Account";
            tabPageAccount.UseVisualStyleBackColor = true;
            // 
            // version
            // 
            version.AutoSize = true;
            version.Location = new Point(451, 5);
            version.Name = "version";
            version.Size = new Size(13, 15);
            version.TabIndex = 9;
            version.Text = "1";
            // 
            // lblEmail
            // 
            lblEmail.AutoSize = true;
            lblEmail.Location = new Point(7, 4);
            lblEmail.Name = "lblEmail";
            lblEmail.Size = new Size(36, 15);
            lblEmail.TabIndex = 0;
            lblEmail.Text = "Email";
            // 
            // txtEmail
            // 
            txtEmail.Location = new Point(7, 24);
            txtEmail.Name = "txtEmail";
            txtEmail.Size = new Size(217, 23);
            txtEmail.TabIndex = 1;
            // 
            // lblPassword
            // 
            lblPassword.AutoSize = true;
            lblPassword.Location = new Point(267, 4);
            lblPassword.Name = "lblPassword";
            lblPassword.Size = new Size(57, 15);
            lblPassword.TabIndex = 2;
            lblPassword.Text = "Password";
            // 
            // txtPassword
            // 
            txtPassword.Location = new Point(267, 24);
            txtPassword.Name = "txtPassword";
            txtPassword.PasswordChar = '*';
            txtPassword.Size = new Size(200, 23);
            txtPassword.TabIndex = 3;
            // 
            // btnLogin
            // 
            btnLogin.Location = new Point(7, 53);
            btnLogin.Name = "btnLogin";
            btnLogin.Size = new Size(193, 24);
            btnLogin.TabIndex = 4;
            btnLogin.Text = "Login";
            btnLogin.UseVisualStyleBackColor = true;
            btnLogin.Click += btnLogin_Click;
            // 
            // btnLogout
            // 
            btnLogout.Location = new Point(304, 53);
            btnLogout.Name = "btnLogout";
            btnLogout.Size = new Size(163, 24);
            btnLogout.TabIndex = 5;
            btnLogout.Text = "Log out";
            btnLogout.UseVisualStyleBackColor = true;
            btnLogout.Click += btnLogout_Click;
            // 
            // lblAccountStatus
            // 
            lblAccountStatus.AutoSize = true;
            lblAccountStatus.Location = new Point(7, 87);
            lblAccountStatus.Name = "lblAccountStatus";
            lblAccountStatus.Size = new Size(80, 15);
            lblAccountStatus.TabIndex = 6;
            lblAccountStatus.Text = "Not logged in";
            // 
            // lblLogTitle
            // 
            lblLogTitle.AutoSize = true;
            lblLogTitle.Location = new Point(7, 112);
            lblLogTitle.Name = "lblLogTitle";
            lblLogTitle.Size = new Size(67, 15);
            lblLogTitle.TabIndex = 7;
            lblLogTitle.Text = "Agent Logs";
            // 
            // txtAgentLog
            // 
            txtAgentLog.Location = new Point(7, 130);
            txtAgentLog.Multiline = true;
            txtAgentLog.Name = "txtAgentLog";
            txtAgentLog.ReadOnly = true;
            txtAgentLog.ScrollBars = ScrollBars.Vertical;
            txtAgentLog.Size = new Size(460, 191);
            txtAgentLog.TabIndex = 8;
            // 
            // tabPage1
            // 
            tabPage1.Controls.Add(label1);
            tabPage1.Controls.Add(lblShopId);
            tabPage1.Controls.Add(dataGridPendingPrintData);
            tabPage1.Controls.Add(btnBrowse);
            tabPage1.Controls.Add(btnPrint);
            tabPage1.Controls.Add(cmbPrinters);
            tabPage1.Controls.Add(cmbColorType);
            tabPage1.Controls.Add(cmbPageSize);
            tabPage1.Controls.Add(txtFilePath);
            tabPage1.Location = new Point(4, 24);
            tabPage1.Name = "tabPage1";
            tabPage1.Padding = new Padding(3);
            tabPage1.Size = new Size(476, 300);
            tabPage1.TabIndex = 0;
            tabPage1.Text = "tabPage1";
            tabPage1.UseVisualStyleBackColor = true;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(44, 23);
            label1.Name = "label1";
            label1.Size = new Size(53, 15);
            label1.TabIndex = 20;
            label1.Text = "Shop Id :";
            // 
            // lblShopId
            // 
            lblShopId.AutoSize = true;
            lblShopId.Location = new Point(113, 23);
            lblShopId.Name = "lblShopId";
            lblShopId.Size = new Size(13, 15);
            lblShopId.TabIndex = 19;
            lblShopId.Text = "5";
            // 
            // dataGridPendingPrintData
            // 
            dataGridPendingPrintData.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            dataGridPendingPrintData.Location = new Point(6, 73);
            dataGridPendingPrintData.Name = "dataGridPendingPrintData";
            dataGridPendingPrintData.Size = new Size(1085, 410);
            dataGridPendingPrintData.TabIndex = 18;
            // 
            // btnBrowse
            // 
            btnBrowse.Location = new Point(238, 490);
            btnBrowse.Name = "btnBrowse";
            btnBrowse.Size = new Size(75, 23);
            btnBrowse.TabIndex = 17;
            btnBrowse.Text = "btnBrowse";
            btnBrowse.UseVisualStyleBackColor = true;
            btnBrowse.Click += btnBrowse_Click;
            // 
            // btnPrint
            // 
            btnPrint.Location = new Point(819, 489);
            btnPrint.Name = "btnPrint";
            btnPrint.Size = new Size(75, 23);
            btnPrint.TabIndex = 16;
            btnPrint.Text = "Print";
            btnPrint.Click += btnPrint_Click;
            // 
            // cmbPrinters
            // 
            cmbPrinters.FormattingEnabled = true;
            cmbPrinters.Location = new Point(565, 490);
            cmbPrinters.Name = "cmbPrinters";
            cmbPrinters.Size = new Size(121, 23);
            cmbPrinters.TabIndex = 12;
            // 
            // cmbColorType
            // 
            cmbColorType.FormattingEnabled = true;
            cmbColorType.Location = new Point(692, 490);
            cmbColorType.Name = "cmbColorType";
            cmbColorType.Size = new Size(121, 23);
            cmbColorType.TabIndex = 15;
            // 
            // cmbPageSize
            // 
            cmbPageSize.FormattingEnabled = true;
            cmbPageSize.Location = new Point(438, 489);
            cmbPageSize.Name = "cmbPageSize";
            cmbPageSize.Size = new Size(121, 23);
            cmbPageSize.TabIndex = 14;
            // 
            // txtFilePath
            // 
            txtFilePath.Location = new Point(332, 490);
            txtFilePath.Name = "txtFilePath";
            txtFilePath.Size = new Size(100, 23);
            txtFilePath.TabIndex = 13;
            // 
            // tabPage2
            // 
            tabPage2.Controls.Add(dataGridCompletedPrintData);
            tabPage2.Location = new Point(4, 24);
            tabPage2.Name = "tabPage2";
            tabPage2.Padding = new Padding(3);
            tabPage2.Size = new Size(476, 300);
            tabPage2.TabIndex = 1;
            tabPage2.Text = "tabPage2";
            tabPage2.UseVisualStyleBackColor = true;
            // 
            // dataGridCompletedPrintData
            // 
            dataGridCompletedPrintData.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            dataGridCompletedPrintData.Location = new Point(6, 6);
            dataGridCompletedPrintData.Name = "dataGridCompletedPrintData";
            dataGridCompletedPrintData.Size = new Size(1085, 523);
            dataGridCompletedPrintData.TabIndex = 0;
            // 
            // tabPage3
            // 
            tabPage3.Controls.Add(dataGridPrinterSetting);
            tabPage3.Controls.Add(btnSavePrinterSetting);
            tabPage3.Controls.Add(cBoxSettingPrinter);
            tabPage3.Controls.Add(cBoxSettingColor);
            tabPage3.Controls.Add(cBoxSettingPage);
            tabPage3.Controls.Add(label2);
            tabPage3.Location = new Point(4, 24);
            tabPage3.Name = "tabPage3";
            tabPage3.Padding = new Padding(3);
            tabPage3.Size = new Size(476, 300);
            tabPage3.TabIndex = 2;
            tabPage3.Text = "tabPage3";
            tabPage3.UseVisualStyleBackColor = true;
            // 
            // dataGridPrinterSetting
            // 
            dataGridPrinterSetting.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            dataGridPrinterSetting.Location = new Point(6, 118);
            dataGridPrinterSetting.Name = "dataGridPrinterSetting";
            dataGridPrinterSetting.Size = new Size(464, 176);
            dataGridPrinterSetting.TabIndex = 5;
            dataGridPrinterSetting.CellContentClick += dataGridPrinterSetting_CellContentClick;
            // 
            // btnSavePrinterSetting
            // 
            btnSavePrinterSetting.Location = new Point(365, 19);
            btnSavePrinterSetting.Name = "btnSavePrinterSetting";
            btnSavePrinterSetting.Size = new Size(105, 91);
            btnSavePrinterSetting.TabIndex = 4;
            btnSavePrinterSetting.Text = "Save Settings";
            btnSavePrinterSetting.UseVisualStyleBackColor = true;
            btnSavePrinterSetting.Click += btnSavePrinterSetting_Click;
            // 
            // cBoxSettingPrinter
            // 
            cBoxSettingPrinter.FormattingEnabled = true;
            cBoxSettingPrinter.Location = new Point(6, 69);
            cBoxSettingPrinter.Name = "cBoxSettingPrinter";
            cBoxSettingPrinter.Size = new Size(353, 23);
            cBoxSettingPrinter.TabIndex = 3;
            // 
            // cBoxSettingColor
            // 
            cBoxSettingColor.FormattingEnabled = true;
            cBoxSettingColor.Location = new Point(210, 21);
            cBoxSettingColor.Name = "cBoxSettingColor";
            cBoxSettingColor.Size = new Size(149, 23);
            cBoxSettingColor.TabIndex = 2;
            // 
            // cBoxSettingPage
            // 
            cBoxSettingPage.FormattingEnabled = true;
            cBoxSettingPage.Location = new Point(3, 21);
            cBoxSettingPage.Name = "cBoxSettingPage";
            cBoxSettingPage.Size = new Size(201, 23);
            cBoxSettingPage.TabIndex = 1;
            cBoxSettingPage.SelectedIndexChanged += cBoxSettingPage_SelectedIndexChanged;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(5, 3);
            label2.Name = "label2";
            label2.Size = new Size(82, 15);
            label2.TabIndex = 0;
            label2.Text = "Printer Setting";
            // 
            // close
            // 
            close.AutoSize = true;
            close.BackColor = Color.Brown;
            close.Font = new Font("Arial Black", 18F, FontStyle.Bold, GraphicsUnit.Point, 0);
            close.ForeColor = Color.White;
            close.Location = new Point(451, 2);
            close.Name = "close";
            close.Size = new Size(34, 33);
            close.TabIndex = 7;
            close.Text = "X";
            close.Visible = false;
            close.Click += close_Click;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(488, 360);
            Controls.Add(close);
            Controls.Add(tabControl1);
            MaximizeBox = false;
            Name = "Form1";
            ShowIcon = false;
            ShowInTaskbar = false;
            TopMost = true;
            Load += Form1_Load;
            trayMenu.ResumeLayout(false);
            tabControl1.ResumeLayout(false);
            tabPageAccount.ResumeLayout(false);
            tabPageAccount.PerformLayout();
            tabPage1.ResumeLayout(false);
            tabPage1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridPendingPrintData).EndInit();
            tabPage2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)dataGridCompletedPrintData).EndInit();
            tabPage3.ResumeLayout(false);
            tabPage3.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridPrinterSetting).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private ContextMenuStrip trayMenu;
        private ToolStripMenuItem openMenuItem;
        private ToolStripMenuItem exitMenuItem;
        private NotifyIcon trayIcon;
        private TabControl tabControl1;
        private TabPage tabPageAccount;
        private Label lblEmail;
        private TextBox txtEmail;
        private Label lblPassword;
        private TextBox txtPassword;
        private Button btnLogin;
        private Button btnLogout;
        private Label lblAccountStatus;
        private Label lblLogTitle;
        private TextBox txtAgentLog;
        private TabPage tabPage1;
        private TabPage tabPage2;
        private Button btnBrowse;
        private Button btnPrint;
        private ComboBox cmbPrinters;
        private ComboBox cmbColorType;
        private ComboBox cmbPageSize;
        private TextBox txtFilePath;
        private Label label1;
        private Label lblShopId;
        private DataGridView dataGridPendingPrintData;
        private DataGridView dataGridCompletedPrintData;
        private TabPage tabPage3;
        private DataGridView dataGridPrinterSetting;
        private Button btnSavePrinterSetting;
        private ComboBox cBoxSettingPrinter;
        private ComboBox cBoxSettingColor;
        private ComboBox cBoxSettingPage;
        private Label label2;
        private Label version;
        private Label close;
    }
}
