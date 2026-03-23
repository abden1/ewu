export interface EmailTemplate {
  subjects: string[];
  html: (vars: TemplateVars) => string;
  text: (vars: TemplateVars) => string;
}

export interface TemplateVars {
  senderName: string;
  recipientName: string;
  company?: string;
}

const BUSINESS_TEMPLATES: EmailTemplate[] = [
  {
    subjects: [
      "Quick question about your workflow",
      "Checking in on the project",
      "Following up on our last conversation",
    ],
    html: (v) => `<p>Hi ${v.recipientName},</p><p>I hope this message finds you well. I wanted to reach out and check in on how things are going on your end. We've been making some great progress on our side and I'd love to connect to compare notes.</p><p>Would you be available for a quick call this week?</p><p>Best,<br>${v.senderName}</p>`,
    text: (v) => `Hi ${v.recipientName},\n\nI hope this message finds you well. I wanted to reach out and check in on how things are going on your end. We've been making some great progress on our side and I'd love to connect to compare notes.\n\nWould you be available for a quick call this week?\n\nBest,\n${v.senderName}`,
  },
  {
    subjects: [
      "Partnership opportunity",
      "Collaboration idea I'd like to share",
      "Let's work together",
    ],
    html: (v) => `<p>Hi ${v.recipientName},</p><p>I came across your work recently and was really impressed. I think there could be a great opportunity for us to collaborate on a project that would benefit both of our teams.</p><p>I'd love to set up a brief introductory call. Do you have 15 minutes this week?</p><p>Looking forward to hearing from you,<br>${v.senderName}${v.company ? `<br>${v.company}` : ""}</p>`,
    text: (v) => `Hi ${v.recipientName},\n\nI came across your work recently and was really impressed. I think there could be a great opportunity for us to collaborate on a project that would benefit both of our teams.\n\nI'd love to set up a brief introductory call. Do you have 15 minutes this week?\n\nLooking forward to hearing from you,\n${v.senderName}${v.company ? `\n${v.company}` : ""}`,
  },
  {
    subjects: [
      "Resource I thought you'd find useful",
      "Sharing something valuable",
      "This might help with what you're working on",
    ],
    html: (v) => `<p>Hey ${v.recipientName},</p><p>I was reading through some industry reports this morning and came across something I thought you'd find really valuable for what you're working on.</p><p>Happy to share the full report if you're interested. Just let me know!</p><p>Cheers,<br>${v.senderName}</p>`,
    text: (v) => `Hey ${v.recipientName},\n\nI was reading through some industry reports this morning and came across something I thought you'd find really valuable for what you're working on.\n\nHappy to share the full report if you're interested. Just let me know!\n\nCheers,\n${v.senderName}`,
  },
];

const NETWORKING_TEMPLATES: EmailTemplate[] = [
  {
    subjects: [
      "Great to meet you at the event",
      "Following up from the conference",
      "Enjoyed our conversation",
    ],
    html: (v) => `<p>Hi ${v.recipientName},</p><p>It was great connecting with you recently. I really enjoyed our conversation and wanted to follow up to keep the dialogue going.</p><p>I'd love to stay in touch and explore potential synergies between what we're each working on.</p><p>Best regards,<br>${v.senderName}</p>`,
    text: (v) => `Hi ${v.recipientName},\n\nIt was great connecting with you recently. I really enjoyed our conversation and wanted to follow up to keep the dialogue going.\n\nI'd love to stay in touch and explore potential synergies between what we're each working on.\n\nBest regards,\n${v.senderName}`,
  },
  {
    subjects: [
      "Mutual connection suggested I reach out",
      "Referred by a colleague",
      "Connecting through our shared network",
    ],
    html: (v) => `<p>Hello ${v.recipientName},</p><p>A mutual connection suggested I reach out to you. They thought our work was well-aligned and that we'd benefit from knowing each other.</p><p>I'd love to introduce myself and learn more about what you're up to. Are you open to a brief call?</p><p>Warm regards,<br>${v.senderName}</p>`,
    text: (v) => `Hello ${v.recipientName},\n\nA mutual connection suggested I reach out to you. They thought our work was well-aligned and that we'd benefit from knowing each other.\n\nI'd love to introduce myself and learn more about what you're up to. Are you open to a brief call?\n\nWarm regards,\n${v.senderName}`,
  },
];

const CASUAL_TEMPLATES: EmailTemplate[] = [
  {
    subjects: [
      "Coffee catch-up?",
      "Been a while - how are things?",
      "Long time no talk!",
    ],
    html: (v) => `<p>Hey ${v.recipientName}!</p><p>Hope you're doing well! It's been a while since we last caught up. I was thinking about you recently and wanted to reach out.</p><p>Would love to grab a virtual coffee and hear what you've been up to. Are you free sometime this week?</p><p>Talk soon,<br>${v.senderName}</p>`,
    text: (v) => `Hey ${v.recipientName}!\n\nHope you're doing well! It's been a while since we last caught up. I was thinking about you recently and wanted to reach out.\n\nWould love to grab a virtual coffee and hear what you've been up to. Are you free sometime this week?\n\nTalk soon,\n${v.senderName}`,
  },
  {
    subjects: [
      "Quick update from my side",
      "Sharing some exciting news",
      "Thought you'd want to hear this",
    ],
    html: (v) => `<p>Hi ${v.recipientName},</p><p>Just wanted to drop you a quick note with a small update. Things have been pretty exciting on my end lately and I always value your perspective on these things.</p><p>Would love to hear what you think when you get a chance!</p><p>Best,<br>${v.senderName}</p>`,
    text: (v) => `Hi ${v.recipientName},\n\nJust wanted to drop you a quick note with a small update. Things have been pretty exciting on my end lately and I always value your perspective on these things.\n\nWould love to hear what you think when you get a chance!\n\nBest,\n${v.senderName}`,
  },
];

const REPLY_TEMPLATES = [
  (originalSubject: string, senderName: string, recipientName: string) => ({
    subject: `Re: ${originalSubject}`,
    html: `<p>Hi ${recipientName},</p><p>Thanks for reaching out! This sounds really interesting. I'd be happy to connect and discuss further.</p><p>Looking forward to it!</p><p>Best,<br>${senderName}</p>`,
    text: `Hi ${recipientName},\n\nThanks for reaching out! This sounds really interesting. I'd be happy to connect and discuss further.\n\nLooking forward to it!\n\nBest,\n${senderName}`,
  }),
  (originalSubject: string, senderName: string, recipientName: string) => ({
    subject: `Re: ${originalSubject}`,
    html: `<p>Hey ${recipientName},</p><p>Great to hear from you! Yes, definitely interested in exploring this. Let's find a time to chat.</p><p>Cheers,<br>${senderName}</p>`,
    text: `Hey ${recipientName},\n\nGreat to hear from you! Yes, definitely interested in exploring this. Let's find a time to chat.\n\nCheers,\n${senderName}`,
  }),
  (originalSubject: string, senderName: string, recipientName: string) => ({
    subject: `Re: ${originalSubject}`,
    html: `<p>Hello ${recipientName},</p><p>Thank you for the message. This is exactly the kind of thing I've been thinking about. I appreciate you taking the time.</p><p>Kind regards,<br>${senderName}</p>`,
    text: `Hello ${recipientName},\n\nThank you for the message. This is exactly the kind of thing I've been thinking about. I appreciate you taking the time.\n\nKind regards,\n${senderName}`,
  }),
];

export type TemplateCategory = "business" | "networking" | "casual";

export function getRandomTemplate(category: TemplateCategory): EmailTemplate {
  const pool =
    category === "business"
      ? BUSINESS_TEMPLATES
      : category === "networking"
      ? NETWORKING_TEMPLATES
      : CASUAL_TEMPLATES;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomSubject(template: EmailTemplate): string {
  return template.subjects[Math.floor(Math.random() * template.subjects.length)];
}

export function getReplyContent(
  originalSubject: string,
  senderName: string,
  recipientName: string
) {
  const replyFn = REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)];
  return replyFn(originalSubject, senderName, recipientName);
}
