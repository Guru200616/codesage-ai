export interface Language {
  name: string;
  percentage: number;
}

export interface FindingsCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  languages: Language[];
  mainLanguage: string;
  framework: string;
  healthScore: number;
  findingsCount: FindingsCount;
  docCoverage: number;
  testCoverage: number;
  maintainabilityIndex: number;
}

export interface RepoFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size: number;
  content?: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file: string;
  line: number;
  description: string;
  remediation: string;
  codeSnippet: string;
}

export interface CodeSmell {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  file: string;
  line: number;
  description: string;
  recommendation: string;
  rule: string;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'controller' | 'service' | 'model' | 'utility' | 'route' | 'database' | 'module';
  file: string;
  percentage?: number; // visual weighting
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DocItem {
  id: string;
  category: 'readme' | 'api' | 'setup' | 'architecture' | 'developer';
  title: string;
  content: string; // Markdown formatted
}

export interface TestSuite {
  id: string;
  file: string;
  framework: 'jest' | 'pytest' | 'junit';
  coverage: number;
  tests: {
    name: string;
    type: 'unit' | 'integration' | 'edge';
    code: string;
  }[];
}

export interface FlowNode {
  id: string;
  label: string;
  description: string;
  file: string;
  step: number;
  type: 'client' | 'controller' | 'service' | 'repository' | 'database';
  code: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  references?: {
    file: string;
    line?: number;
    codeSnippet?: string;
  }[];
}

export interface AnalysisResult {
  repository: Repository;
  files: RepoFile[];
  vulnerabilities: Vulnerability[];
  codeSmells: CodeSmell[];
  dependencyGraph: {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
  };
  documentation: DocItem[];
  testSuites: TestSuite[];
  flowTrace: FlowNode[];
}
