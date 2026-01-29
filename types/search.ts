/**
 * Visibility levels for documents and searches
 */
export enum VisibilityLevel {
  PRIVATE = "PRIVATE",
  DEPARTMENT = "DEPARTMENT",
  ORGANIZATION = "ORGANIZATION",
  PUBLIC = "PUBLIC",
}

/**
 * Search history entry
 */
export interface SearchHistoryEntry {
  id: number;
  userId: number;
  query: string;
  resultCount: number;
  timestamp: string; // ISO format: "2024-01-25T14:30:00"
  searchedScopesJson?: string; // JSON array of VisibilityLevel
  userDepartment?: string;
  userOrganization?: string;
  filtersJson?: string;
  executionTimeMs?: number;
  errorMessage?: string;
  wasSuccessful: boolean;
}

/**
 * Parsed search scopes from JSON
 */
export type SearchScopes = VisibilityLevel[];

/**
 * User's scope assignments
 */
export interface UserScopes {
  userId: number;
  department?: string;
  organization?: string;
  roleLevel?: string;
}

/**
 * Multi-scope search request
 */
export interface MultiScopeSearchRequest {
  query: string;
  nResults?: number;
  scopes?: VisibilityLevel[];
  departmentFilter?: string;
  organizationFilter?: string;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  text: string;
  distance: number;
  sourceDocument: string;
  fileId?: string;
  collectionName?: string;
  visibilityLevel?: VisibilityLevel;
  scope?: string;
}

/**
 * Multi-scope search response
 */
export interface MultiScopeSearchResponse {
  results: SearchResultItem[];
  scopeBreakdown: Record<string, number>; // {"PRIVATE": 2, "DEPARTMENT": 3}
  success: boolean;
  message: string;
  executionTimeMs?: number;
}

/**
 * Paginated search history response
 */
export interface SearchHistoryPageResponse {
  content: SearchHistoryEntry[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  message: string;
  success: boolean;
}

/**
 * Search analytics
 */
export interface SearchAnalytics {
  totalSearches: number;
  scopeUsageDistribution: Record<string, number>;
  averageResultsPerSearch: number;
  averageExecutionTimeMs?: number;
  resultCountDistribution: Record<string, number>;
  topQueries: string[];
  searchesByDay?: Record<string, number>;
}

/**
 * Parsed search history entry with converted scopes
 */
export interface ParsedSearchHistoryEntry extends SearchHistoryEntry {
  parsedScopes: VisibilityLevel[];
  parsedFilters?: {
    departmentFilter?: string;
    organizationFilter?: string;
  };
}
