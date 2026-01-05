import { AppTemplate } from "./AppTemplate";
import { Inbox, Trash2, Archive, Star, Search, Reply, Forward, Paperclip, Download, Eye, EyeOff, LogOut } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAppContext } from "../AppContext";
import { useSessionStorage } from "@/hooks/useSessionStorage.ts";
import { useElementSize } from "@/hooks/useElementSize.ts";
import { cn } from "../ui/utils";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useI18n } from "@/i18n";
import { useFileSystem } from "../FileSystemContext";
import { notify } from "@/services/notifications";

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  archived: boolean;
  deleted: boolean;
  attachments?: EmailAttachment[];
}

const mockEmails: Email[] = [];

// Load emails from global mailbox storage
const loadMailboxEmails = (): Email[] => {
  const mailboxKey = 'global_mailbox';
  const mailboxData = localStorage.getItem(mailboxKey);
  if (mailboxData) {
    try {
      const { emails } = JSON.parse(mailboxData);
      return emails || [];
    } catch {
      return [];
    }
  }
  return [];
};

export function Mail({ owner }: { owner?: string }) {
  const { t } = useI18n();
  const { createFile, resolvePath } = useFileSystem();
  const { accentColor } = useAppContext();

  // Authentication state
  const [currentUser, setCurrentUser] = useSessionStorage<string | null>(
    "mail-current-user",
    null,
    owner
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeMailbox, setActiveMailbox] = useSessionStorage(
    "mail-active-mailbox",
    "inbox",
    owner
  );

  const [storedEmails, setStoredEmails] = useSessionStorage<Email[]>(
    "mail-emails",
    mockEmails,
    owner
  );
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load emails from mailbox storage when user logs in
  useEffect(() => {
    if (currentUser) {
      const mailboxEmails = loadMailboxEmails();
      setStoredEmails(mailboxEmails);
      // Select the first email if available
      if (mailboxEmails.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedEmailId(mailboxEmails[0].id);
      }
    }
  }, [currentUser, setStoredEmails]);

  // Responsive container measurement - must be called before early return
  const [containerRef, { width }] = useElementSize();
  const showSidebar = width >= 450;

  // Handle login - supports both TrustMail and local accounts
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginEmail.trim()) {
      setAuthError("Please enter your email");
      return;
    }

    if (!loginPassword) {
      setAuthError("Please enter your password");
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      // Check TrustMail accounts
      const trustmailAccounts = JSON.parse(
        localStorage.getItem("trustmail_accounts") || "{}"
      );

      if (trustmailAccounts[loginEmail]) {
        if (trustmailAccounts[loginEmail].password !== loginPassword) {
          setAuthLoading(false);
          setAuthError("Invalid password");
          return;
        }
        setAuthLoading(false);
        setCurrentUser(loginEmail);
        setLoginEmail("");
        setLoginPassword("");
        return;
      }

      // Check ProMail accounts
      const promailAccounts = JSON.parse(
        localStorage.getItem("promail_accounts") || "{}"
      );

      if (promailAccounts[loginEmail]) {
        if (promailAccounts[loginEmail].password !== loginPassword) {
          setAuthLoading(false);
          setAuthError("Invalid password");
          return;
        }
        setAuthLoading(false);
        setCurrentUser(loginEmail);
        setLoginEmail("");
        setLoginPassword("");
        return;
      }

      // Check local mail accounts (legacy)
      const mailAccounts = JSON.parse(
        localStorage.getItem("mail_accounts") || "{}"
      );

      if (mailAccounts[loginEmail]) {
        if (mailAccounts[loginEmail].password !== loginPassword) {
          setAuthLoading(false);
          setAuthError("Invalid password");
          return;
        }
        setAuthLoading(false);
        setCurrentUser(loginEmail);
        setLoginEmail("");
        setLoginPassword("");
        return;
      }

      setAuthLoading(false);
      setAuthError("Account not found");
    }, 600);
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setAuthError("");
  };

  // Ensure timestamps are Date objects (they become strings when stored in localStorage)
  const emails = useMemo(() => {
    return storedEmails.map((email) => ({
      ...email,
      timestamp:
        email.timestamp instanceof Date
          ? email.timestamp
          : new Date(email.timestamp),
    }));
  }, [storedEmails]);

  const setEmails = (value: Email[] | ((prev: Email[]) => Email[])) => {
    if (typeof value === "function") {
      setStoredEmails((prev) => {
        const normalizedPrev = prev.map((email) => ({
          ...email,
          timestamp:
            email.timestamp instanceof Date
              ? email.timestamp
              : new Date(email.timestamp),
        }));
        return value(normalizedPrev);
      });
    } else {
      setStoredEmails(value);
    }
  };

  // Filter emails based on active mailbox
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by mailbox
    if (activeMailbox === "inbox") {
      filtered = filtered.filter((e) => !e.deleted && !e.archived);
    } else if (activeMailbox === "starred") {
      filtered = filtered.filter((e) => e.starred && !e.deleted);
    } else if (activeMailbox === "archived") {
      filtered = filtered.filter((e) => e.archived && !e.deleted);
    } else if (activeMailbox === "trash") {
      filtered = filtered.filter((e) => e.deleted);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.from.toLowerCase().includes(query) ||
          e.subject.toLowerCase().includes(query) ||
          e.body.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [emails, activeMailbox, searchQuery]);

  const selectedEmail = selectedEmailId
    ? filteredEmails.find((e) => e.id === selectedEmailId)
    : null;

  // Show login page if not authenticated
  if (!currentUser) {
    return (
      <AppTemplate
        content={
          <div className="min-h-full bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700 rounded-xl p-6 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-lg font-bold text-white">Mail</h1>
                  <p className="text-xs text-gray-400">Sign in to your account</p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                    {authError}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-3 py-2 pr-9 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {authLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                {/* Info */}
                <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                  <p className="text-xs text-gray-400">Create an account via an email provider</p>

                </div>
              </div>
            </div>
          </div>
        }
        hasSidebar={false}
      />
    );
  }

  const mailSidebar = {
    sections: [
      {
        title: t("mail.sidebar.mailboxes"),
        items: [
          {
            id: "inbox",
            label: t("mail.sidebar.inbox"),
            icon: Inbox,
            badge: "4",
          },
          { id: "starred", label: t("mail.sidebar.starred"), icon: Star },
          { id: "archived", label: t("mail.sidebar.archived"), icon: Archive },
          { id: "trash", label: t("mail.sidebar.trash"), icon: Trash2 },
        ],
      },
    ],
  };

  const unreadCount = emails.filter(
    (e) => !e.read && !e.deleted && !e.archived
  ).length;
  const updatedSidebar = {
    ...mailSidebar,
    sections: mailSidebar.sections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === "inbox"
          ? {
              ...item,
              badge: unreadCount > 0 ? unreadCount.toString() : undefined,
            }
          : item
      ),
    })),
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId && !e.read ? { ...e, read: true } : e))
    );
  };

  const handleToggleStar = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, starred: !email.starred } : email
      )
    );
  };

  const handleDelete = () => {
    if (!selectedEmailId) return;
    setEmails((prev) =>
      prev.map((e) => (e.id === selectedEmailId ? { ...e, deleted: true } : e))
    );
    setSelectedEmailId(filteredEmails[0]?.id || null);
  };

  const handleArchive = () => {
    if (!selectedEmailId) return;
    setEmails((prev) =>
      prev.map((e) =>
        e.id === selectedEmailId ? { ...e, archived: !e.archived } : e
      )
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t("mail.time.minutesAgo", { minutes: diffMins });
    if (diffHours < 24) return t("mail.time.hoursAgo", { hours: diffHours });
    if (diffDays === 0) return t("mail.time.today");
    if (diffDays === 1) return t("mail.time.yesterday");
    if (diffDays < 7) return t("mail.time.daysAgo", { days: diffDays });
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadAttachment = (attachment: EmailAttachment) => {
    const downloadsPath = resolvePath('~/Downloads', owner);
    const success = createFile(
      downloadsPath,
      attachment.name,
      attachment.content
    );

    if (success) {
      notify.system(
        "success",
        t("mail.attachments.downloaded"),
        t("mail.attachments.downloadedTo", {
          name: attachment.name,
          folder: "Downloads",
        })
      );
    } else {
      notify.system(
        "error",
        t("mail.attachments.downloadFailed"),
        t("mail.attachments.downloadFailedMessage", { name: attachment.name })
      );
    }
  };

  const content = ({ contentWidth }: { contentWidth: number }) => {
    const isCompact = contentWidth < 400;
    const emailListWidth = isCompact
      ? 80
      : Math.min(360, Math.floor(contentWidth * 0.35));

    return (
      <div className="flex h-full min-w-0">
        {/* Email List */}
        <div
          className="border-r border-white/10 overflow-y-auto flex flex-col shrink-0"
          style={{ width: `${emailListWidth}px` }}
        >
          {/* Search Bar */}
          <div className={cn("p-2", isCompact && "flex justify-center")}>
            {!isCompact ? (
              <GlassInput
                placeholder={t("mail.search.placeholder")}
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20"
              />
            ) : (
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Email List Items */}
          <div className="space-y-1 px-1 flex-1">
            {filteredEmails.length === 0 ? (
              <div className="text-center text-white/40 text-sm py-8">
                {searchQuery
                  ? t("mail.empty.noEmailsFound")
                  : t("mail.empty.noEmails")}
              </div>
            ) : (
              filteredEmails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
                  className={cn(
                    "w-full flex items-start gap-2 p-3 rounded-lg transition-colors text-left",
                    selectedEmailId === email.id
                      ? "bg-white/10"
                      : "hover:bg-white/5",
                    isCompact && "justify-center px-2"
                  )}
                  title={isCompact ? email.subject : undefined}
                >
                  <div className="relative mt-1 shrink-0">
                    <button
                      onClick={(e) => handleToggleStar(email.id, e)}
                      className="transition-transform active:scale-95"
                    >
                      <Star
                        className={cn(
                          "w-4 h-4 transition-colors",
                          email.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30 hover:text-white/60"
                        )}
                      />
                    </button>
                    {isCompact && !email.read && (
                      <div
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[#1E1E1E] pointer-events-none"
                        style={{ backgroundColor: accentColor }}
                      />
                    )}
                  </div>

                  {!isCompact && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm truncate",
                            email.read
                              ? "text-white/70"
                              : "text-white font-semibold"
                          )}
                        >
                          {email.from}
                        </span>
                        <span className="text-xs text-white/40 shrink-0">
                          {formatTime(email.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "text-sm truncate flex-1",
                            email.read
                              ? "text-white/50"
                              : "text-white/80 font-medium"
                          )}
                        >
                          {email.subject}
                        </div>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {email.body.replace(/<[^>]*>/g, "").substring(0, 60)}...
                      </div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Email Viewer */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="border-b border-white/10 p-4 shrink-0 bg-white/5 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold text-lg mb-1 wrap-break-word">
                      {selectedEmail.subject}
                    </h2>
                    <div className="text-sm text-white/70">
                      <span className="font-medium">{selectedEmail.from}</span>
                      <span className="text-white/40">
                        {" "}
                        &lt;{selectedEmail.fromEmail}&gt;
                      </span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {selectedEmail.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleStar(selectedEmail.id, {} as React.MouseEvent)
                    }
                    className="shrink-0"
                  >
                    <Star
                      className={cn(
                        "w-5 h-5 transition-colors",
                        selectedEmail.starred
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/30 hover:text-white/60"
                      )}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <GlassButton size="sm" className="gap-2">
                    <Reply className="w-4 h-4" />
                    {t("mail.actions.reply")}
                  </GlassButton>
                  <GlassButton size="sm" className="gap-2">
                    <Forward className="w-4 h-4" />
                    {t("mail.actions.forward")}
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    onClick={handleArchive}
                    className="gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    {selectedEmail.archived
                      ? t("mail.actions.unarchive")
                      : t("mail.actions.archive")}
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("mail.actions.delete")}
                  </GlassButton>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-6 text-sm text-white/90 prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-5 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-5 pl-6 space-y-3">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-5 pl-6 space-y-3">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white/95">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-white/85">{children}</em>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3 text-white">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {selectedEmail.body}
                </ReactMarkdown>

                {/* Attachments */}
                {selectedEmail.attachments &&
                  selectedEmail.attachments.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-4 text-white/70">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {selectedEmail.attachments.length === 1
                            ? t("mail.attachments.count", {
                                count: selectedEmail.attachments.length,
                              })
                            : t("mail.attachments.count_plural", {
                                count: selectedEmail.attachments.length,
                              })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedEmail.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white/90 truncate">
                                {attachment.name}
                              </div>
                              <div className="text-xs text-white/50">
                                {formatFileSize(attachment.size)}
                              </div>
                            </div>
                            <div className="shrink-0 text-white/40 group-hover:text-white/70 transition-colors">
                              <Download className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/40">
                <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("mail.empty.selectEmail")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* User Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {currentUser?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentUser}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Email Client */}
      <div ref={containerRef} className="flex-1 min-h-0">
        <AppTemplate
          sidebar={updatedSidebar}
          content={content}
          hasSidebar={showSidebar}
          activeItem={activeMailbox}
          onItemClick={(id) => setActiveMailbox(id)}
          minContentWidth={0}
        />
      </div>
    </div>
  );
}

import { AppMenuConfig } from "@/types.ts";

export const mailMenuConfig: AppMenuConfig = {
  menus: ["File", "Edit", "View", "Mailbox", "Message", "Window", "Help"],
  items: {
    Mailbox: [
      {
        label: "New Mailbox",
        labelKey: "mail.menu.newMailbox",
        action: "new-mailbox",
      },
      { type: "separator" },
      {
        label: "Online Status",
        labelKey: "mail.menu.onlineStatus",
        action: "toggle-online",
      },
    ],
    Message: [
      {
        label: "New Message",
        labelKey: "mail.menu.newMessage",
        shortcut: "⌘N",
        action: "new-message",
      },
      { type: "separator" },
      {
        label: "Reply",
        labelKey: "mail.menu.reply",
        shortcut: "⌘R",
        action: "reply",
      },
      {
        label: "Reply All",
        labelKey: "mail.menu.replyAll",
        shortcut: "⇧⌘R",
        action: "reply-all",
      },
      {
        label: "Forward",
        labelKey: "mail.menu.forward",
        shortcut: "⇧⌘F",
        action: "forward",
      },
    ],
  },
};
