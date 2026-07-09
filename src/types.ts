export interface StakeholderImpact {
  issuers: string;
  acquirers: string;
  networks: string;
  fintechs: string;
}

export interface NewsItem {
  category: string;
  headline: string;
  summary: string;
  strategicView: string;
  technicalView: string;
  expertInsights: string;
  createdAt: string;
  relevanceScore: number;
  stakeholderImpact: StakeholderImpact;
  sourceLink?: string;
  sourceName?: string;
}
