export interface PageSections {
  title?: string;
  choices: SupportType[];
}

export interface QuestionSection {
  title: string;
  help?: string;
}

export interface SupportPage {
  type?: undefined;
  id: string;
  title: string;
  shortHelp: string;
  prologue?: string;
  epilogue?: string;
  sections: QuestionSection[];
  canAttachFiles?: boolean;
  privateTicket?: boolean;
  ghIssuePreset?: string;
  includeDebugData?: boolean;
  repositories?: { repo: string, name: string }[];
}

export interface ExternalLink {
  type: 'link',
  url: string;
  title: string;
  shortHelp: string;
}

export type SupportType = SupportPage | ExternalLink;

export const supportTypes: PageSections[] = [
  {
    choices: [
      {
        id: "report-bug",
        title: "Report a bug",
        shortHelp: "Have you found some sort of bug? If so, we would love to know about it.",
        sections: [
          {
            title: "What happened?",
            help: "Please describe what happened to you as detailed as possible"
          },
          {
            title: "What did you expect to happen?"
          },
          {
            title: "How did you reproduce it?",
          },
          {
            title: "Something we have missed?",
          },
        ],
        includeDebugData: true,
        privateTicket: true,
        canAttachFiles: true,
        ghIssuePreset: "report-bug.md",
        repositories: [
          { repo: 'portmaster', name: 'Portmaster Core' },
          { repo: 'portmaster-ui', name: 'User Interface' },
          { repo: 'portmaster-packaging', name: 'Packaging & Installers' },
          { repo: 'spn', name: 'SPN' },
          { repo: 'support-hub', name: 'Testing' },
        ]
      },
      {
        id: "give-feedback",
        title: "Give Feedback",
        shortHelp: "We really want your feedback, we read every feedback message we get.",
        sections: [
          {
            title: "What would you like to add or change?",
          },
          {
            title: "Why do you and others need this?"
          }
        ],
        includeDebugData: false,
        privateTicket: true,
        canAttachFiles: true,
        ghIssuePreset: "suggest-feature.md",
      },
      {
        type: 'link',
        title: 'Documentation',
        url: 'https://docs.safing.io/',
        shortHelp: 'See the complete documentation of the Portmaster',
      },
    ],
  },
  {
    title: "Helpful Resources",
    choices: [
      {
        type: 'link',
        title: 'Backlog',
        url: 'https://safing.io/backlog',
        shortHelp: 'Want to see a bigger picture of future planned features? Well, this is the place for you.',
      },
    ]
  }
]

