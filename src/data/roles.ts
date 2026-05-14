// CareerOS Role Dataset - Structured Role Categories
// Replaces hardcoded dropdowns with comprehensive role data

export interface RoleCategory {
  category: string;
  roles: string[];
  keywords: string[];
  priority: number;
  description: string;
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    category: "Cybersecurity",
    roles: [
      "SOC Analyst",
      "Penetration Tester",
      "Security Analyst",
      "Threat Hunter",
      "Cloud Security Engineer",
      "Incident Responder",
      "Security Engineer",
      "Information Security Analyst",
      "Malware Analyst",
      "Digital Forensics Analyst",
      "Compliance Analyst",
      "Security Operations Manager",
      "Vulnerability Assessor",
      "Security Consultant",
      "Application Security Engineer"
    ],
    keywords: [
      "siem", "splunk", "soc", "incident response", "threat detection", "log analysis", "edr",
      "mitre attack", "firewall", "ids", "ips", "vulnerability assessment", "penetration testing",
      "nist", "iso 27001", "risk assessment", "security policies", "compliance", "auditing",
      "network security", "endpoint security", "cloud security", "azure security", "aws security",
      "threat intelligence", "malware analysis", "digital forensics", "encryption", "zero trust",
      "security operations", "cybersecurity", "information security", "data protection"
    ],
    priority: 1,
    description: "Roles focused on protecting systems, networks, and data from cyber threats"
  },
  {
    category: "Software Engineering",
    roles: [
      "Software Engineer",
      "Senior Software Engineer",
      "Staff Software Engineer",
      "Principal Software Engineer",
      "Full Stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Platform Engineer",
      "Software Architect",
      "Mobile Developer",
      "Game Developer",
      "Embedded Systems Engineer",
      "Quality Assurance Engineer"
    ],
    keywords: [
      "javascript", "typescript", "react", "node.js", "python", "java", "aws", "docker", "kubernetes",
      "git", "ci/cd", "microservices", "apis", "rest", "graphql", "sql", "nosql", "mongodb",
      "postgresql", "redis", "elasticsearch", "kafka", "terraform", "ansible", "jenkins", "github",
      "agile", "scrum", "unit testing", "integration testing", "performance optimization"
    ],
    priority: 1,
    description: "Roles focused on designing, developing, and maintaining software applications"
  },
  {
    category: "AI/ML",
    roles: [
      "AI Engineer",
      "ML Engineer",
      "Prompt Engineer",
      "AI Researcher",
      "Computer Vision Engineer",
      "NLP Engineer",
      "ML Platform Engineer",
      "AI Product Manager",
      "Research Scientist",
      "Deep Learning Engineer",
      "Machine Learning Scientist",
      "Data Scientist",
      "AI Ethics Engineer",
      "Robotics Engineer",
      "Voice AI Engineer"
    ],
    keywords: [
      "machine learning", "deep learning", "neural networks", "transformers", "bert", "gpt", "llm",
      "prompt engineering", "fine-tuning", "model deployment", "mlops", "kubeflow", "mlflow",
      "computer vision", "opencv", "image recognition", "object detection", "nlp", "spacy",
      "hugging face", "langchain", "vector databases", "pinecone", "weaviate", "chromadb",
      "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy", "jupyter",
      "artificial intelligence", "natural language processing", "reinforcement learning"
    ],
    priority: 1,
    description: "Roles focused on artificial intelligence, machine learning, and data science"
  },
  {
    category: "Design",
    roles: [
      "UX Designer",
      "UI Designer",
      "Product Designer",
      "Senior UX Designer",
      "Design Lead",
      "Visual Designer",
      "Interaction Designer",
      "Service Designer",
      "Design Systems Designer",
      "UX Researcher",
      "Brand Designer",
      "Motion Designer",
      "3D Designer",
      "Game Designer",
      "Industrial Designer"
    ],
    keywords: [
      "figma", "sketch", "adobe xd", "figjam", "miro", "prototyping", "wireframing",
      "user research", "usability testing", "a/b testing", "design systems", "component libraries",
      "responsive design", "mobile design", "web design", "accessibility", "wcag", "user journey",
      "information architecture", "interaction design", "visual design", "typography", "color theory",
      "css", "html", "javascript", "react", "vue", "angular", "design tokens", "branding"
    ],
    priority: 1,
    description: "Roles focused on user experience, interface design, and visual communication"
  },
  {
    category: "Marketing",
    roles: [
      "Marketing Manager",
      "Digital Marketing Manager",
      "Content Marketing Manager",
      "Growth Marketing Manager",
      "Performance Marketing Manager",
      "Brand Manager",
      "Product Marketing Manager",
      "SEO Manager",
      "Social Media Manager",
      "Email Marketing Manager",
      "Marketing Analyst",
      "Content Strategist",
      "Growth Hacker",
      "Marketing Operations Manager",
      "Influencer Marketing Manager"
    ],
    keywords: [
      "seo", "sem", "ppc", "google ads", "facebook ads", "linkedin ads", "content marketing",
      "email marketing", "marketing automation", "hubspot", "marketo", "salesforce", "analytics",
      "google analytics", "adobe analytics", "mixpanel", "amplitude", "conversion rate",
      "customer acquisition", "retention marketing", "brand strategy", "campaign management",
      "social media marketing", "influencer marketing", "affiliate marketing", "growth hacking",
      "content strategy", "copywriting", "branding", "marketing roi", "customer journey"
    ],
    priority: 1,
    description: "Roles focused on promoting products, building brands, and customer acquisition"
  },
  {
    category: "Writing",
    roles: [
      "Content Writer",
      "Technical Writer",
      "Copywriter",
      "UX Writer",
      "Content Strategist",
      "Grant Writer",
      "Proposal Writer",
      "Documentation Writer",
      "Blog Writer",
      "Social Media Writer",
      "Email Copywriter",
      "Product Description Writer",
      "Script Writer",
      "Journalist",
      "Editor"
    ],
    keywords: [
      "writing", "content creation", "copywriting", "technical writing", "documentation",
      "blogging", "content strategy", "seo writing", "email marketing", "social media",
      "editing", "proofreading", "grammar", "style guides", "user manuals", "api documentation",
      "grant writing", "proposal writing", "creative writing", "storytelling", "brand voice",
      "content management", "cms", "wordpress", "content calendars", "editorial planning"
    ],
    priority: 2,
    description: "Roles focused on creating written content, documentation, and communications"
  },
  {
    category: "Education",
    roles: [
      "Teacher",
      "Professor",
      "English Teacher",
      "Math Teacher",
      "Science Teacher",
      "School Principal",
      "Education Administrator",
      "Curriculum Developer",
      "Instructional Designer",
      "Education Consultant",
      "Academic Advisor",
      "Online Instructor",
      "Education Technology Specialist",
      "Training Specialist",
      "Learning Experience Designer"
    ],
    keywords: [
      "teaching", "curriculum development", "lesson planning", "classroom management", "student assessment",
      "educational technology", "online learning", "lms", "canvas", "blackboard", "zoom",
      "pedagogy", "differentiated instruction", "special education", "gifted education",
      "educational leadership", "school administration", "academic advising", "research methods",
      "educational psychology", "learning outcomes", "assessment design", "professional development",
      "instructional design", "e-learning", "virtual classroom", "student engagement"
    ],
    priority: 2,
    description: "Roles focused on teaching, curriculum development, and educational administration"
  },
  {
    category: "Finance",
    roles: [
      "Financial Analyst",
      "Investment Banker",
      "Portfolio Manager",
      "Risk Analyst",
      "Financial Controller",
      "Accountant",
      "Tax Advisor",
      "Wealth Manager",
      "Credit Analyst",
      "Treasury Analyst",
      "Financial Planner",
      "Compliance Officer",
      "Audit Manager",
      "Budget Analyst",
      "Financial Consultant"
    ],
    keywords: [
      "financial modeling", "valuation", "dcf", "comparable analysis", "risk management", "derivatives",
      "portfolio management", "asset allocation", "trading", "investment analysis", "market research",
      "financial reporting", "gaap", "ifrs", "sec filings", "earnings analysis", "budgeting",
      "forecasting", "variance analysis", "cost accounting", "managerial accounting", "tax planning",
      "excel", "power bi", "tableau", "sql", "python", "r", "financial analysis", "investment"
    ],
    priority: 1,
    description: "Roles focused on financial analysis, investment management, and accounting"
  },
  {
    category: "Business",
    roles: [
      "Business Analyst",
      "Product Manager",
      "Project Manager",
      "Operations Manager",
      "Business Development Manager",
      "Strategy Consultant",
      "Management Consultant",
      "Business Intelligence Analyst",
      "Data Analyst",
      "Revenue Operations Manager",
      "Customer Success Manager",
      "Account Manager",
      "Sales Manager",
      "Partnership Manager",
      "Growth Manager"
    ],
    keywords: [
      "business analysis", "requirements gathering", "stakeholder management", "process improvement",
      "data analysis", "business intelligence", "sql", "excel", "tableau", "power bi",
      "project management", "agile", "scrum", "kanban", "risk management", "resource planning",
      "business development", "sales", "marketing", "customer relationship management",
      "strategic planning", "market analysis", "competitive analysis", "financial modeling",
      "operations management", "supply chain", "logistics", "quality management", "lean"
    ],
    priority: 1,
    description: "Roles focused on business operations, analysis, and strategic management"
  },
  {
    category: "DevOps",
    roles: [
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Platform Engineer",
      "Infrastructure Engineer",
      "Cloud Engineer",
      "Automation Engineer",
      "Release Manager",
      "Build Engineer",
      "Configuration Management Engineer",
      "Monitoring Engineer",
      "Performance Engineer",
      "Security DevOps Engineer",
      "Database DevOps Engineer",
      "Network Engineer",
      "Systems Engineer"
    ],
    keywords: [
      "devops", "ci/cd", "jenkins", "gitlab ci", "github actions", "docker", "kubernetes",
      "terraform", "ansible", "puppet", "chef", "infrastructure as code", "cloud computing",
      "aws", "azure", "gcp", "monitoring", "prometheus", "grafana", "elasticsearch", "logstash",
      "kibana", "nagios", "zabbix", "performance tuning", "automation", "scripting",
      "bash", "python", "go", "linux", "networking", "security", "scalability"
    ],
    priority: 1,
    description: "Roles focused on development operations, infrastructure, and automation"
  },
  {
    category: "Cloud",
    roles: [
      "Cloud Engineer",
      "Cloud Architect",
      "Solutions Architect",
      "Cloud Security Engineer",
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Cloud Consultant",
      "Infrastructure Engineer",
      "Platform Engineer",
      "Migration Specialist",
      "Cloud Operations Engineer",
      "Multi-Cloud Engineer",
      "Serverless Engineer",
      "Cloud Native Engineer",
      "Edge Computing Engineer"
    ],
    keywords: [
      "cloud computing", "aws", "azure", "gcp", "oracle cloud", "ibm cloud", "alibaba cloud",
      "infrastructure as a service", "platform as a service", "software as a service",
      "serverless", "lambda", "functions", "containers", "docker", "kubernetes",
      "terraform", "cloudformation", "arm templates", "deployment manager",
      "cloud security", "iam", "vpc", "load balancer", "auto scaling", "cdn",
      "monitoring", "logging", "backup", "disaster recovery", "migration"
    ],
    priority: 1,
    description: "Roles focused on cloud infrastructure, architecture, and services"
  }
];

// Helper functions for role matching and suggestions
export const getAllRoles = (): string[] => {
  return ROLE_CATEGORIES.flatMap(category => category.roles);
};

export const getRolesByCategory = (category: string): string[] => {
  const found = ROLE_CATEGORIES.find(cat => cat.category.toLowerCase() === category.toLowerCase());
  return found ? found.roles : [];
};

export const getKeywordsForRole = (role: string): string[] => {
  for (const category of ROLE_CATEGORIES) {
    if (category.roles.includes(role)) {
      return category.keywords;
    }
  }
  return [];
};

export const searchRoles = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return getAllRoles().filter(role => 
    role.toLowerCase().includes(lowerQuery) || 
    lowerQuery.includes(role.toLowerCase().substring(0, Math.min(lowerQuery.length, 3)))
  ).slice(0, 10);
};

export const getRoleCategories = (): string[] => {
  return ROLE_CATEGORIES.map(cat => cat.category);
};

export const getCategoryForRole = (role: string): string | null => {
  for (const category of ROLE_CATEGORIES) {
    if (category.roles.includes(role)) {
      return category.category;
    }
  }
  return null;
};

export const getRoleDescription = (role: string): string => {
  for (const category of ROLE_CATEGORIES) {
    if (category.roles.includes(role)) {
      return category.description;
    }
  }
  return "";
};

export const getHighPriorityRoles = (): string[] => {
  return ROLE_CATEGORIES
    .filter(cat => cat.priority === 1)
    .flatMap(cat => cat.roles);
};
