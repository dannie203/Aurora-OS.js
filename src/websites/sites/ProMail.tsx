/**
 * ProMail - Professional email service website
 * Potential use: Phishing scenarios, credential harvesting, social engineering
 */
import { useState } from 'react';
import { WebsiteHeader, WebsiteLayout, WebsiteContainer, WebsiteProps } from '@/websites';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ProMailAccount {
  email: string;
  password: string;
  createdAt: string;
}

export function ProMail(_props: WebsiteProps) {
  const [page, setPage] = useState<'home' | 'signup' | 'success' | 'exists'>('home');
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');

  // Check if user already created an account (globally across all mail services)
  const hasCreatedAccount = () => {
    return localStorage.getItem('global_mail_account') !== null;
  };

  const getCreatedEmail = () => {
    return localStorage.getItem('global_mail_account') || '';
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
      // Use the username directly to create email with @promail.pro domain
      const promailEmail = `${formData.email}@promail.pro`;

      // Check if email already exists
      const existingAccounts = JSON.parse(localStorage.getItem('promail_accounts') || '{}');
      if (existingAccounts[promailEmail]) {
        setLoading(false);
        setError('This username is already registered');
        return;
      }

      const newAccount: ProMailAccount = {
        email: promailEmail,
        password: formData.password,
        createdAt: new Date().toISOString(),
      };

      existingAccounts[promailEmail] = newAccount;
      localStorage.setItem('promail_accounts', JSON.stringify(existingAccounts));
      // Mark that this user has created a global mail account
      localStorage.setItem('global_mail_account', promailEmail);

      // Initialize global mailbox with welcome emails
      const welcomeEmails = [
        {
          id: "welcome-1",
          from: "ProMail Team",
          fromEmail: "support@promail.pro",
          subject: "Welcome to ProMail!",
          body: `Hello,

Welcome to ProMail! We're thrilled to have you join our community.

Your professional email account has been successfully created and is ready to use. With ProMail, you get:

- **Enterprise-Grade Security:** Military-grade encryption for all communications
- **Professional Features:** Advanced filtering, organizing, and scheduling tools
- **Unlimited Storage:** 30GB of storage included
- **Business Integration:** Seamless integration with productivity tools
- **24/7 Premium Support:** Dedicated support team for all your needs

Get started by customizing your account settings and adding contacts. If you need any assistance, our support team is always available at support@promail.pro.

Welcome aboard!

Best regards,
The ProMail Team`,
          timestamp: new Date(),
          read: false,
          starred: false,
          archived: false,
          deleted: false,
        },
        {
          id: "job-offer-1",
          from: "HR Department",
          fromEmail: "hr@promail.pro",
          subject: "Career Opportunity - Full Stack Developer (Remote)",
          body: `Hi there,

Thank you for choosing ProMail! We're reaching out with an exciting opportunity that might interest you.

**Position:** Full Stack Developer
**Department:** Technology
**Location:** Remote (Global)
**Employment Type:** Full-time

We're expanding our engineering team and looking for talented developers to help us scale. This is an excellent opportunity to work on challenging projects and grow your career in a supportive environment.

**About the role:**
- Develop and maintain web applications using modern technologies
- Collaborate with designers, product managers, and other engineers
- Contribute to system architecture and technical decisions
- Participate in code reviews and knowledge sharing
- Work on both frontend and backend technologies

**Requirements:**
- 3+ years of software development experience
- Proficiency in JavaScript/TypeScript and modern frameworks
- Experience with backend technologies (Node.js, Python, or similar)
- Understanding of databases and API design
- Familiarity with version control and agile workflows
- Strong problem-solving abilities

**What we offer:**
- Competitive salary package
- Fully remote position with flexible hours
- Comprehensive health benefits
- Professional development budget
- Stock options
- Collaborative and innovative work environment

Please review the attached job description and feel free to reach out with any questions!

Best regards,
HR Department`,
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          starred: false,
          archived: false,
          deleted: false,
          attachments: [
            {
              id: "job-desc-1",
              name: "Job_Description_Full_Stack_Developer.txt",
              size: 5200,
              type: "application/text",
              content: `JOB DESCRIPTION - Full Stack Developer

COMPANY: ProMail Inc.
POSITION: Full Stack Developer
DEPARTMENT: Technology
LOCATION: Remote
SALARY RANGE: $120,000 - $160,000 per year

COMPANY OVERVIEW:
ProMail is a leading professional email and communication platform trusted by thousands of businesses worldwide. We're committed to providing secure, reliable, and feature-rich communication solutions.

JOB SUMMARY:
We're seeking a talented Full Stack Developer to join our growing engineering team. You'll be responsible for developing and maintaining both frontend and backend components of our platform, working with modern technologies and best practices.

KEY RESPONSIBILITIES:
- Build responsive web interfaces using modern frontend frameworks
- Develop robust backend APIs and services
- Collaborate with product and design teams
- Write clean, maintainable, and well-tested code
- Participate in architectural discussions and code reviews
- Mentor junior developers when needed

REQUIRED QUALIFICATIONS:
- 3+ years of professional software development experience
- Expert-level proficiency in JavaScript or TypeScript
- Strong understanding of React, Vue, or Angular
- Experience with Node.js or Python for backend development
- Knowledge of relational and non-relational databases
- Experience with REST APIs and GraphQL
- Git proficiency and understanding of CI/CD
- Strong communication and teamwork skills

PREFERRED QUALIFICATIONS:
- Experience with cloud platforms (AWS, GCP, Azure)
- Knowledge of containerization (Docker, Kubernetes)
- Experience with testing frameworks and practices
- Understanding of security best practices
- Open source contributions

BENEFITS & PERKS:
- Competitive salary and benefits
- Remote work with flexible schedule
- Health, dental, and vision insurance
- 401(k) with company match
- Unlimited paid time off
- Professional development opportunities
- Home office setup allowance
- Stock options program

APPLICATION INSTRUCTIONS:
Interested candidates should submit:
1. Resume/CV
2. Cover letter
3. Portfolio or GitHub profile (optional)
4. References

Contact: hr@promail.pro

Equal Opportunity Employer: ProMail is committed to building a diverse and inclusive team.`,
            },
          ],
        },
      ];
      // Store in global mailbox (one mailbox for all mail services)
      localStorage.setItem('global_mailbox', JSON.stringify({ emails: welcomeEmails }));

      // Store the created email for display
      setFormData(prev => ({ ...prev, email: promailEmail }));

      setLoading(false);
      setPage('success');
    }, 1500);
  };

  const handleHome = () => {
    if (hasCreatedAccount()) {
      setPage('exists');
      setExistingEmail(getCreatedEmail());
    } else {
      setPage('home');
    }
    setFormData({ email: '', password: '', confirmPassword: '' });
    setError('');
  };

  // Already created account page
  if (page === 'exists') {
    return (
      <WebsiteLayout bg="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <WebsiteHeader
          bg="bg-white"
          logo={
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">ProMail</div>
                <div className="text-xs text-gray-500">Professional email for everyone</div>
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

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600 mb-2">Your registered email:</p>
                <p className="text-lg font-semibold text-gray-900">{existingEmail}</p>
              </div>

              <p className="text-gray-600 mb-8">
                You have already created a ProMail account. One account per user is allowed. Use the credentials from your existing account to log into the Mail application.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setPage('home')}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
    // If user already has account, show the exists page
    if (hasCreatedAccount()) {
      return (
        <WebsiteLayout bg="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <WebsiteHeader
            bg="bg-white"
            logo={
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">ProMail</div>
                  <div className="text-xs text-gray-500">Professional email for everyone</div>
                </div>
              </div>
            }
            actions={
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-gray-600 font-medium">Enterprise Grade</span>
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

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Your email:</p>
                  <p className="text-base font-semibold text-gray-900">{getCreatedEmail()}</p>
                </div>

                <p className="text-gray-600 mb-6">
                  You have already created a ProMail account. Use your credentials to sign into the Mail application.
                </p>

                <button
                  onClick={() => {
                    setPage('home');
                    setFormData({ email: '', password: '', confirmPassword: '' });
                  }}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
      <WebsiteLayout bg="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <WebsiteHeader
          bg="bg-white"
          logo={
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">ProMail</div>
                <div className="text-xs text-gray-500">Professional email for everyone</div>
              </div>
            </div>
          }
          actions={
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-gray-600 font-medium">Enterprise Grade</span>
            </div>
          }
        />

        <WebsiteContainer size="lg" className="min-h-[calc(100vh-80px)] flex items-center">
          <div className="w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left side - Marketing */}
              <div>
                <div className="mb-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Email Made Simple</h1>
                  <p className="text-lg text-gray-600 mb-6">
                    Fast, secure, and reliable email service for professionals and businesses worldwide.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                    <span className="text-gray-700">Enterprise-grade security</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                    <span className="text-gray-700">Lightning-fast performance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                    <span className="text-gray-700">Advanced spam protection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                    <span className="text-gray-700">30GB storage included</span>
                  </div>
                </div>
              </div>

              {/* Right side - CTA */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join ProMail</h2>
                <p className="text-gray-600 mb-6">Create your professional email account today</p>

                <button
                  onClick={() => {
                    if (hasCreatedAccount()) {
                      setPage('exists');
                      setExistingEmail(getCreatedEmail());
                    } else {
                      setPage('signup');
                    }
                  }}
                  className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <User className="w-5 h-5" />
                  Get Your Email
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Get an email ending with{' '}
                    <span className="font-semibold text-indigo-600">@promail.pro</span>
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
      <WebsiteLayout bg="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <WebsiteHeader
          bg="bg-white"
          logo={
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">ProMail</div>
                <div className="text-xs text-gray-500">Professional email for everyone</div>
              </div>
            </div>
          }
        />

        <WebsiteContainer size="md" className="min-h-[calc(100vh-80px)] flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                <p className="text-gray-600">Join our growing community of professionals</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@promail.pro</span>
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
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
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
    <WebsiteLayout bg="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <WebsiteHeader
        bg="bg-white"
        logo={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">ProMail</div>
              <div className="text-xs text-gray-500">Professional email for everyone</div>
            </div>
          </div>
        }
      />

      <WebsiteContainer size="md" className="min-h-[calc(100vh-80px)] flex items-center">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-indigo-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ProMail!</h1>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-2">Your professional email address:</p>
              <p className="text-lg font-semibold text-gray-900 break-all">{formData.email}</p>
            </div>

            <p className="text-gray-600 mb-8">
              Your professional email account is ready to use. Log in to the Mail application with your new credentials.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleHome}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
