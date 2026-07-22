export type DocumentStatus = 'pending' | 'processed' | 'failed';
export type DocumentType = 'pdf' | 'docx' | 'txt';

export interface AppDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  sizeBytes: number;
  uploadDate: string;
  status: DocumentStatus;
  pages: number;
}

export interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  aiQuestions: number;
  storageUsed: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: string;
}

export interface ChatSource {
  document: string;
  page?: number;
  excerpt: string;
}

export interface UploadStage {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalDocuments: 24,
  processedDocuments: 21,
  aiQuestions: 156,
  storageUsed: '2.4 GB',
};

export const MOCK_DOCUMENTS: AppDocument[] = [
  { id: 'd1', name: 'Q4 Financial Report.pdf', type: 'pdf', size: '4.2 MB', sizeBytes: 4200000, uploadDate: '2026-07-15', status: 'processed', pages: 24 },
  { id: 'd2', name: 'Employee Handbook.docx', type: 'docx', size: '1.8 MB', sizeBytes: 1800000, uploadDate: '2026-07-14', status: 'pending', pages: 42 },
  { id: 'd3', name: 'Product Specs v3.pdf', type: 'pdf', size: '3.5 MB', sizeBytes: 3500000, uploadDate: '2026-07-13', status: 'failed', pages: 18 },
  { id: 'd4', name: 'Meeting Notes.txt', type: 'txt', size: '12 KB', sizeBytes: 12000, uploadDate: '2026-07-13', status: 'processed', pages: 1 },
  { id: 'd5', name: 'Research Paper - AI Trends.pdf', type: 'pdf', size: '8.1 MB', sizeBytes: 8100000, uploadDate: '2026-07-12', status: 'pending', pages: 56 },
  { id: 'd6', name: 'Contract Template.docx', type: 'docx', size: '2.3 MB', sizeBytes: 2300000, uploadDate: '2026-07-11', status: 'failed', pages: 12 },
  { id: 'd7', name: 'Q2 Earnings Summary.pdf', type: 'pdf', size: '1.1 MB', sizeBytes: 1100000, uploadDate: '2026-07-10', status: 'processed', pages: 8 },
  { id: 'd8', name: 'Architecture Overview.docx', type: 'docx', size: '5.7 MB', sizeBytes: 5700000, uploadDate: '2026-07-10', status: 'pending', pages: 33 },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'What are the key financial highlights from Q4?',
    timestamp: '10:32 AM',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: 'Based on the Q4 Financial Report, the key highlights include:\n\n• **Total Revenue**: $4.3M, up 18% YoY\n• **Operating Margin**: 24.5%, surpassing the 22% target\n• **New Deals Closed**: 47 enterprise contracts worth $2.1M\n• **Cost Reduction**: 12% decrease in infrastructure costs due to cloud optimization\n\nThe company exceeded its Q4 revenue guidance by 6%.',
    sources: [
      { document: 'Q4 Financial Report.pdf', page: 3, excerpt: 'Revenue for Q4 reached $4.3M, representing 18% year-over-year growth...' },
      { document: 'Q4 Financial Report.pdf', page: 7, excerpt: 'Operating margin improved to 24.5%, exceeding the target of 22%...' },
    ],
    timestamp: '10:32 AM',
  },
  {
    id: 'm3',
    role: 'user',
    content: 'What are the main sections in the Employee Handbook?',
    timestamp: '10:35 AM',
  },
  {
    id: 'm4',
    role: 'assistant',
    content: 'The Employee Handbook (42 pages) covers these main sections:\n\n1. **Company Culture & Values** (p. 1-5)\n2. **Code of Conduct** (p. 6-12)\n3. **Compensation & Benefits** (p. 13-20)\n4. **Leave Policies** (p. 21-28)\n5. **Remote Work Guidelines** (p. 29-34)\n6. **Performance Reviews** (p. 35-38)\n7. **IT & Security Policies** (p. 39-42)',
    sources: [
      { document: 'Employee Handbook.docx', excerpt: 'Table of Contents showing seven major sections across 42 pages...' },
    ],
    timestamp: '10:35 AM',
  },
  {
    id: 'm5',
    role: 'user',
    content: 'What are the remote work guidelines?',
    timestamp: '10:38 AM',
  },
];

export interface MonthlyDataPoint {
  month: string;
  documents: number;
  questions: number;
}

export interface DocTypeDistribution {
  type: DocumentType;
  count: number;
  label: string;
}

export const MOCK_MONTHLY_DATA: MonthlyDataPoint[] = [
  { month: 'Jan', documents: 4, questions: 12 },
  { month: 'Feb', documents: 7, questions: 18 },
  { month: 'Mar', documents: 5, questions: 15 },
  { month: 'Apr', documents: 9, questions: 24 },
  { month: 'May', documents: 11, questions: 29 },
  { month: 'Jun', documents: 8, questions: 22 },
  { month: 'Jul', documents: 14, questions: 36 },
];

export const MOCK_DOC_TYPE_DIST: DocTypeDistribution[] = [
  { type: 'pdf', count: 14, label: 'PDF' },
  { type: 'docx', count: 7, label: 'DOCX' },
  { type: 'txt', count: 3, label: 'TXT' },
];

export const FILE_TYPE_ICONS: Record<DocumentType, string> = {
  pdf: 'file-text',
  docx: 'file-text',
  txt: 'file',
};

export const documentStatusVariant = (status: DocumentStatus) => {
  switch (status) {
    case 'processed': return 'success' as const;
    case 'pending': return 'warning' as const;
    case 'failed': return 'error' as const;
  }
};

export const documentTypeLabel = (type: DocumentType) => {
  switch (type) {
    case 'pdf': return 'PDF';
    case 'docx': return 'DOCX';
    case 'txt': return 'TXT';
  }
};
