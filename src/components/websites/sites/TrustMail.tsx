/**
 * TrustMail - Fake email service website
 * Potential use: Phishing scenarios, credential harvesting, social engineering
 */
import { encodePassword } from "../../../utils/authUtils";
import { useState } from 'react';
import { WebsiteHeader, WebsiteLayout, WebsiteContainer, WebsiteProps } from '@/components/websites';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { useFileSystem } from '@/components/FileSystemContext';


interface TrustMailAccount {
    email: string;
    password: string;
    createdAt: string;
    owner: string;
}

export function TrustMail({ owner }: WebsiteProps) {
    const [page, setPage] = useState<'home' | 'signup' | 'success' | 'exists'>('home');
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [existingEmail, setExistingEmail] = useState('');

    const { createFile, writeFile, createDirectory, homePath: userHome, currentUser: activeUser } = useFileSystem();

    // Effective user for account ownership (supports sudo browser)
    const effectiveUser = owner || activeUser || 'guest';

    // Check if the current OS user has any account registered in the system
    const hasPersonalAccount = () => {
        const accounts = JSON.parse(localStorage.getItem('trustmail_accounts') || '{}');
        return Object.values(accounts).some((acc: any) => acc.owner === effectiveUser);
    };

    // Check if there is a global session active on this browser
    const hasActiveSession = () => {
        return localStorage.getItem('global_mail_account') !== null;
    };

    const getCreatedEmail = () => {
        // Preference 1: Current browser session
        const sessionEmail = localStorage.getItem('global_mail_account');
        if (sessionEmail) return sessionEmail;

        // Preference 2: Last account created by this OS user (or legacy accounts with no owner)
        const accounts = JSON.parse(localStorage.getItem('trustmail_accounts') || '{}');
        const userAccounts = Object.values(accounts)
            .filter((acc: any) => acc.owner === effectiveUser || !acc.owner)
            .sort((a: any, b: any) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            });

        return userAccounts.length > 0 ? (userAccounts[0] as any).email : '';
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email.trim()) {
            setError('Please enter a username');
            return;
        }

        if (formData.email.includes('@')) {
            setError('Username cannot contain @');
            return;
        }

        if (formData.email.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Create account
        setLoading(true);
        setTimeout(() => {
            // Use the username directly to create email with @trustmail.com domain
            const trustmailEmail = `${formData.email} @trustmail.com`;

            // Check if email already exists
            const existingAccounts = JSON.parse(localStorage.getItem('trustmail_accounts') || '{}');
            if (existingAccounts[trustmailEmail]) {
                setLoading(false);
                setError('This username is already registered');
                return;
            }

            const newAccount: TrustMailAccount = {
                email: trustmailEmail,
                password: encodePassword(formData.password),
                createdAt: new Date().toISOString(),
                owner: effectiveUser,
            };

            existingAccounts[trustmailEmail] = newAccount;
            localStorage.setItem('trustmail_accounts', JSON.stringify(existingAccounts));
            // Mark that this user has created a global mail account
            localStorage.setItem('global_mail_account', trustmailEmail);

            // --- NEW: Hacking Gameplay File System Integration ---
            try {
                // 1. Create/Update .Config/mail.json with credentials
                const configDir = `${userHome}/.Config`;

                // Ensure .Config exists
                createDirectory(userHome, '.Config', effectiveUser || undefined);

                // Write credentials file
                const mailConfig = {
                    email: trustmailEmail,
                    password: encodePassword(formData.password),
                    provider: 'trustmail',
                    updatedAt: new Date().toISOString()
                };

                // Use createFile for new file instead of writeFile
                createFile(configDir, 'mail.json', JSON.stringify(mailConfig, null, 2), effectiveUser || undefined);

                // 2. Initialize .Config/inbox.json with welcome emails

                const welcomeEmails = [
                    {
                        id: "welcome-1",
                        from: "TrustMail Team",
                        fromEmail: "support@trustmail.com",
                        subject: "Welcome to TrustMail!",
                        body: `Hello,\n\nWelcome to TrustMail! We're excited to have you on board.\n\nYour account has been successfully created and is ready to use. With TrustMail, you get:\n\n- **Advanced Security:** End-to-end encryption for all your messages\n- **Unlimited Storage:** Never worry about running out of space\n- **Fast Performance:** Lightning-quick email delivery\n- **24/7 Support:** Our team is always here to help\n\nIf you have any questions or need assistance, feel free to contact our support team at support@trustmail.com.\n\nBest regards,\nThe TrustMail Team`,
                        timestamp: new Date(),
                        read: false,
                        starred: false,
                        archived: false,
                        deleted: false,
                    },
                    {
                        id: "job-offer-1",
                        from: "Recruiting Team",
                        fromEmail: "careers@trustmail.com",
                        subject: "Exciting Job Opportunity - Senior Software Engineer",
                        body: `Hi there,\n\nWe hope you're doing well! We're reaching out because we believe you might be a great fit for an exciting opportunity at our company.\n\n**Position:** Senior Software Engineer\n**Department:** Engineering\n**Location:** Remote\n\nWe're looking for experienced developers who are passionate about building world-class software. This is a fantastic opportunity to work with cutting-edge technologies and collaborate with a talented team.\n\n**What we're looking for:**\n- 5+ years of software development experience\n- Strong proficiency in modern programming languages\n- Experience with cloud technologies (AWS, GCP, or Azure)\n- Excellent problem-solving skills\n- Team player with strong communication\n\n**What we offer:**\n- Competitive salary and benefits package\n- Remote work flexibility\n- Professional development opportunities\n- Collaborative and inclusive work environment\n\nPlease see the attached job description for more details. If you're interested, please reply to this email or visit our careers page.\n\nLooking forward to hearing from you!\n\nBest regards,\nThe Recruiting Team`,
                        timestamp: new Date(Date.now() - 3600000),
                        read: false,
                        starred: false,
                        archived: false,
                        deleted: false,
                        attachments: [
                            {
                                id: "job-desc-1",
                                name: "Job_Description_Senior_Engineer.txt",
                                size: 4500,
                                type: "application/text",
                                content: `JOB DESCRIPTION - Senior Software Engineer\n\nCOMPANY: TrustMail Inc.\nPOSITION: Senior Software Engineer\nDEPARTMENT: Engineering\nLOCATION: Remote\nSALARY RANGE: $150,000 - $200,000 per year\n\nABOUT US:\nWe are a leading email and communication platform serving millions of users worldwide. Our mission is to provide secure, reliable, and user-friendly communication tools.\n\nRESPONSIBILITIES:\n- Design and develop scalable backend services\n- Lead code reviews and mentor junior developers\n- Collaborate with product and design teams\n- Optimize system performance and reliability\n- Contribute to architectural decisions\n\nREQUIRED SKILLS:\n- 5+ years of professional software development experience\n- Strong knowledge of data structures and algorithms\n- Experience with distributed systems\n- Proficiency in multiple programming languages\n- Understanding of security best practices\n- Experience with CI/CD pipelines\n\nNICE TO HAVE:\n- Experience with machine learning applications\n- Knowledge of cryptography\n- Open source contributions\n- Experience with Kubernetes\n\nBENEFITS:\n- Health, dental, and vision insurance\n- 401(k) matching\n- Unlimited PTO\n- Home office setup budget\n- Professional development budget\n- Stock options\n\nAPPLICATION PROCESS:\nPlease submit your resume and a cover letter explaining why you're interested in this position. We review applications on a rolling basis.\n\nContact: careers@trustmail.com`,
                            },
                        ],
                    },
                ];

                createFile(configDir, 'inbox.json', JSON.stringify({ emails: welcomeEmails }, null, 2), effectiveUser || undefined);

                // Also keep legacy global mailbox for now to ensure no data loss during transition if something weird happens,
                // but the File System is now the specific "Hackable" source.
                localStorage.setItem('global_mailbox', JSON.stringify({ emails: welcomeEmails }));

            } catch (err) {
                console.error("Failed to write to file system during account creation:", err);
            }
            // --------------------------------------------------------

            // Store the created email for display
            setFormData(prev => ({ ...prev, email: trustmailEmail }));

            setLoading(false);
            setPage('success');
        }, 1500);
    };

    const handleHome = () => {
        if (hasActiveSession()) {
            setPage('exists');
            setExistingEmail(getCreatedEmail());
        } else {
            setPage('home');
        }
        setFormData({ email: '', password: '', confirmPassword: '' });
        setError('');
        setSuccess(''); // Clear success message
    };

    const [success, setSuccess] = useState('');

    const handleRestoreConfig = () => {
        setLoading(true);
        setError('');
        setSuccess('');

        setTimeout(() => {
            try {
                const globalEmail = getCreatedEmail();
                if (!globalEmail) {
                    setError('No existing account found');
                    setLoading(false);
                    return;
                }

                const accounts = JSON.parse(localStorage.getItem('trustmail_accounts') || '{}');
                const account = accounts[globalEmail];

                if (!account) {
                    setError('Account data missing from storage');
                    setLoading(false);
                    return;
                }

                const configDir = `${userHome}/.Config`;

                // Ensure .Config exists
                createDirectory(userHome, '.Config', effectiveUser || undefined);

                // Restore mail.json ONLY
                const mailConfig = {
                    email: globalEmail,
                    password: account.password,
                    provider: 'trustmail',
                    updatedAt: new Date().toISOString()
                };

                const configPath = `${configDir}/mail.json`;
                writeFile(configPath, JSON.stringify(mailConfig, null, 2), effectiveUser || undefined);
                setSuccess('Configuration restored to ~/.Config/mail.json');
            } catch (err) {
                console.error('Restore failed:', err);
                setError('An unexpected error occurred during restoration');
            }
            setLoading(false);
        }, 1000);
    };

    // Already created account page
    if (page === 'exists') {
        return (
            <WebsiteLayout bg="bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <WebsiteHeader
                    bg="bg-white"
                    logo={
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">TrustMail</div>
                                <div className="text-xs text-gray-500">Secure email service</div>
                            </div>
                        </div>
                    }
                />

                <WebsiteContainer size="md" className="min-h-[calc(100vh-80px)] flex items-center">
                    <div className="w-full max-w-md mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-2xl p-12">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-yellow-600" />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Already Created</h1>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                                <p className="text-sm text-gray-600 mb-2">Your registered email:</p>
                                <p className="text-lg font-semibold text-gray-900">{existingEmail}</p>
                            </div>

                            <p className="text-gray-600 mb-8">
                                You have already created a TrustMail account. One account per user is allowed. Use the credentials from your existing account to log into the Mail application.
                            </p>

                            <div className="space-y-3">
                                {success && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {success}
                                    </div>
                                )}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleRestoreConfig}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <RefreshCcw className="w-4 h-4" />
                                    )}
                                    Restore Configuration
                                </button>

                                <button
                                    onClick={() => setPage('home')}
                                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </WebsiteContainer>
            </WebsiteLayout>
        );
    }

    // Home Page
    if (page === 'home') {
        // If there's an active session, show the exists page
        if (hasActiveSession()) {
            return (
                <WebsiteLayout bg="bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <WebsiteHeader
                        bg="bg-white"
                        logo={
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-900">TrustMail</div>
                                    <div className="text-xs text-gray-500">Secure email service</div>
                                </div>
                            </div>
                        }
                        actions={
                            <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-600 font-medium">Secure Connection</span>
                            </div>
                        }
                    />

                    <WebsiteContainer size="lg" className="min-h-[calc(100vh-80px)] flex items-center">
                        <div className="w-full max-w-md mx-auto text-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-blue-600" />
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Already Registered</h1>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-600 mb-1">Your email:</p>
                                    <p className="text-base font-semibold text-gray-900">{getCreatedEmail()}</p>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    You have already created a TrustMail account. Use your credentials to sign into the Mail application.
                                </p>

                                <button
                                    onClick={() => {
                                        setPage('home');
                                        setFormData({ email: '', password: '', confirmPassword: '' });
                                    }}
                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </WebsiteContainer>
                </WebsiteLayout>
            );
        }

        return (
            <WebsiteLayout bg="bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <WebsiteHeader
                    bg="bg-white"
                    logo={
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">TrustMail</div>
                                <div className="text-xs text-gray-500">Secure email service</div>
                            </div>
                        </div>
                    }
                    actions={
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600 font-medium">Secure Connection</span>
                        </div>
                    }
                />

                <WebsiteContainer size="lg" className="min-h-[calc(100vh-80px)] flex items-center">
                    <div className="w-full max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {/* Left side - Marketing */}
                            <div>
                                <div className="mb-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <Mail className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Secure Email Anytime</h1>
                                    <p className="text-lg text-gray-600 mb-6">
                                        Get your free TrustMail account today. Encrypted, reliable, and private.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                                        <span className="text-gray-700">Military-grade encryption</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                                        <span className="text-gray-700">Unlimited storage</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                                        <span className="text-gray-700">Privacy-first design</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                                        <span className="text-gray-700">Free forever</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - CTA */}
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
                                <p className="text-gray-600 mb-6">Create your account in seconds</p>

                                <button
                                    onClick={() => setPage('signup')}
                                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
                                >
                                    <User className="w-5 h-5" />
                                    Create Account
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Have an account?{' '}
                                        <button className="text-green-600 hover:text-green-700 font-medium">
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </WebsiteContainer>
            </WebsiteLayout>
        );
    }

    // Sign Up Page
    if (page === 'signup') {
        return (
            <WebsiteLayout bg="bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <WebsiteHeader
                    bg="bg-white"
                    logo={
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">TrustMail</div>
                                <div className="text-xs text-gray-500">Secure email service</div>
                            </div>
                        </div>
                    }
                />

                <WebsiteContainer size="md" className="min-h-[calc(100vh-80px)] flex items-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                                <p className="text-gray-600">Join TrustMail today</p>
                            </div>

                            {hasPersonalAccount() && !error && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <strong>Note:</strong> You already have a personal account ({getCreatedEmail()}).
                                            You can create an additional one, or restore your existing configuration.
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRestoreConfig}
                                        disabled={loading}
                                        className="w-full h-9 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <RefreshCcw className="w-3.5 h-3.5" />
                                        )}
                                        Restore Existing Configuration
                                    </button>

                                    {success && (
                                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3" />
                                            {success}
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-left">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-red-800">{error}</div>
                                </div>
                            )}

                            <form onSubmit={handleSignUp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Choose Your Username
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@trustmail.com</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="At least 6 characters"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm your password"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-4 h-4" />
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                <p className="text-sm text-gray-600">
                                    <button
                                        onClick={handleHome}
                                        className="text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Back to home
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </WebsiteContainer>
            </WebsiteLayout>
        );
    }

    // Success Page
    return (
        <WebsiteLayout bg="bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <WebsiteHeader
                bg="bg-white"
                logo={
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">TrustMail</div>
                            <div className="text-xs text-gray-500">Secure email service</div>
                        </div>
                    </div>
                }
            />

            <WebsiteContainer size="md" className="min-h-[calc(100vh-80px)] flex items-center">
                <div className="w-full max-w-md mx-auto text-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to TrustMail!</h1>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                            <p className="text-sm text-gray-600 mb-2">Your email address:</p>
                            <p className="text-lg font-semibold text-gray-900 break-all">{formData.email}</p>
                        </div>

                        <p className="text-gray-600 mb-8">
                            Your secure email account has been created successfully. You can now use these credentials to access the Mail application.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleHome}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </WebsiteContainer>
        </WebsiteLayout>
    );
}
