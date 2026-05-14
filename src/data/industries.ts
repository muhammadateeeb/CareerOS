// CareerOS Industry Dataset - Comprehensive Industry Information
// Dynamic searchable industries for onboarding system

export interface Industry {
  name: string;
  keywords: string[];
  sectors: string[];
  priority: number;
  description: string;
}

export const INDUSTRIES: Industry[] = [
  {
    name: "Technology",
    keywords: [
      "software", "technology", "it", "tech", "digital", "saas", "fintech", "healthtech", "edtech",
      "artificial intelligence", "machine learning", "cloud computing", "cybersecurity", "blockchain",
      "iot", "big data", "analytics", "devops", "agile", "scrum", "api", "microservices",
      "web development", "mobile development", "data science", "software engineering"
    ],
    sectors: [
      "Software Development", "Cloud Services", "Cybersecurity", "AI/ML", "DevOps",
      "Mobile Development", "Web Development", "Data Analytics", "Infrastructure",
      "SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce"
    ],
    priority: 1,
    description: "Industry focused on software, technology services, and digital innovation"
  },
  {
    name: "Healthcare",
    keywords: [
      "healthcare", "medical", "health", "hospital", "clinic", "pharmaceutical", "biotech",
      "medical devices", "telehealth", "electronic health records", "clinical", "patient care",
      "health insurance", "medical research", "diagnostics", "wellness", "public health",
      "medicine", "nursing", "healthcare administration", "medical technology"
    ],
    sectors: [
      "Hospitals", "Pharmaceuticals", "Medical Devices", "Health Insurance",
      "Telemedicine", "Biotechnology", "Diagnostics", "Wellness Services",
      "Medical Research", "Healthcare IT", "Clinical Services", "Public Health"
    ],
    priority: 1,
    description: "Industry focused on medical services, pharmaceuticals, and healthcare delivery"
  },
  {
    name: "Finance",
    keywords: [
      "finance", "financial", "banking", "investment", "fintech", "insurance", "accounting",
      "wealth management", "trading", "risk management", "compliance", "audit", "tax",
      "credit", "lending", "payments", "blockchain", "cryptocurrency", "venture capital",
      "private equity", "asset management", "financial services", "banking"
    ],
    sectors: [
      "Banking", "Investment Management", "Insurance", "FinTech",
      "Accounting", "Wealth Management", "Risk Management", "Payments",
      "Venture Capital", "Private Equity", "Asset Management", "Financial Services"
    ],
    priority: 1,
    description: "Industry focused on financial services, banking, and investment management"
  },
  {
    name: "Education",
    keywords: [
      "education", "teaching", "learning", "academic", "university", "school", "college",
      "online learning", "edtech", "curriculum", "training", "certification", "research",
      "higher education", "k-12", "special education", "educational technology", "pedagogy",
      "instructional design", "e-learning", "academic administration", "student services"
    ],
    sectors: [
      "Higher Education", "K-12 Education", "EdTech", "Online Learning",
      "Educational Publishing", "Training & Development", "Research Institutions",
      "Educational Consulting", "Special Education", "Educational Services"
    ],
    priority: 2,
    description: "Industry focused on educational services, academic institutions, and learning technology"
  },
  {
    name: "Manufacturing",
    keywords: [
      "manufacturing", "production", "factory", "industrial", "supply chain", "logistics",
      "automation", "robotics", "quality control", "lean manufacturing", "six sigma",
      "procurement", "inventory", "warehouse", "distribution", "operations",
      "industrial engineering", "production planning", "quality assurance", "process improvement"
    ],
    sectors: [
      "Automotive", "Aerospace", "Electronics", "Chemicals",
      "Food & Beverage", "Textiles", "Metal Fabrication", "Plastics",
      "Industrial Equipment", "Consumer Goods", "Heavy Manufacturing"
    ],
    priority: 2,
    description: "Industry focused on production, manufacturing processes, and industrial operations"
  },
  {
    name: "Retail",
    keywords: [
      "retail", "sales", "ecommerce", "merchandising", "inventory", "customer service",
      "point of sale", "logistics", "supply chain", "branding", "marketing",
      "consumer goods", "fashion", "electronics", "grocery", "department stores",
      "online retail", "brick and mortar", "retail management", "store operations"
    ],
    sectors: [
      "E-commerce", "Department Stores", "Specialty Retail", "Fast Fashion",
      "Grocery", "Consumer Electronics", "Fashion & Apparel", "Home Goods",
      "Luxury Retail", "Discount Retail", "Convenience Stores"
    ],
    priority: 2,
    description: "Industry focused on retail sales, e-commerce, and consumer goods distribution"
  },
  {
    name: "Consulting",
    keywords: [
      "consulting", "advisory", "management consulting", "strategy", "transformation",
      "business process", "operations", "change management", "organizational development",
      "digital transformation", "it consulting", "strategy consulting", "hr consulting",
      "business analysis", "process improvement", "organizational strategy"
    ],
    sectors: [
      "Management Consulting", "IT Consulting", "Strategy Consulting",
      "HR Consulting", "Digital Transformation", "Operations Consulting",
      "Financial Consulting", "Marketing Consulting", "Technology Consulting"
    ],
    priority: 1,
    description: "Industry focused on professional advisory services and business consulting"
  },
  {
    name: "Media & Entertainment",
    keywords: [
      "media", "entertainment", "publishing", "broadcasting", "film", "television",
      "music", "gaming", "streaming", "content creation", "social media",
      "journalism", "advertising", "marketing", "creative", "digital media",
      "content production", "entertainment technology", "media distribution"
    ],
    sectors: [
      "Film & Television", "Music", "Gaming", "Publishing",
      "Digital Media", "Social Media", "Advertising", "Creative Services",
      "Broadcasting", "Streaming Services", "Entertainment Technology"
    ],
    priority: 2,
    description: "Industry focused on media production, entertainment, and content creation"
  },
  {
    name: "Government & Public Sector",
    keywords: [
      "government", "public sector", "federal", "state", "municipal", "non-profit",
      "public service", "policy", "administration", "regulatory", "compliance",
      "civic", "community", "social services", "defense", "intelligence",
      "public administration", "government services", "policy making"
    ],
    sectors: [
      "Federal Government", "State Government", "Local Government", "Defense",
      "Non-Profit", "Education", "Healthcare", "Social Services",
      "Public Safety", "Regulatory Agencies", "International Relations"
    ],
    priority: 2,
    description: "Industry focused on government services, public administration, and non-profit organizations"
  },
  {
    name: "Energy & Utilities",
    keywords: [
      "energy", "utilities", "electricity", "gas", "water", "renewable energy",
      "solar", "wind", "hydroelectric", "nuclear", "oil", "gas",
      "power generation", "grid", "infrastructure", "sustainability", "clean energy",
      "energy management", "power distribution", "utility services"
    ],
    sectors: [
      "Electricity", "Natural Gas", "Renewable Energy", "Water Utilities",
      "Oil & Gas", "Nuclear Energy", "Energy Trading", "Grid Infrastructure",
      "Solar Energy", "Wind Energy", "Energy Storage"
    ],
    priority: 2,
    description: "Industry focused on energy production, utilities, and infrastructure services"
  },
  {
    name: "Real Estate & Construction",
    keywords: [
      "real estate", "construction", "property", "development", "architecture",
      "building", "infrastructure", "urban planning", "facilities", "maintenance",
      "housing", "commercial", "residential", "industrial", "civil engineering",
      "property management", "real estate development", "construction management"
    ],
    sectors: [
      "Residential Real Estate", "Commercial Real Estate", "Construction",
      "Architecture", "Urban Planning", "Property Management", "Facilities",
      "Infrastructure Development", "Real Estate Investment", "Building Materials"
    ],
    priority: 2,
    description: "Industry focused on real estate, construction, and infrastructure development"
  },
  {
    name: "Transportation & Logistics",
    keywords: [
      "transportation", "logistics", "shipping", "supply chain", "warehouse", "distribution",
      "freight", "trucking", "aviation", "maritime", "railway",
      "delivery", "fleet", "routing", "inventory", "3pl", "last mile",
      "transportation management", "logistics optimization"
    ],
    sectors: [
      "Trucking", "Aviation", "Maritime", "Railway",
      "Warehousing", "Delivery Services", "3PL Services", "Fleet Management",
      "Supply Chain Management", "Transportation Technology", "Logistics Services"
    ],
    priority: 2,
    description: "Industry focused on transportation, logistics, and supply chain management"
  },
  {
    name: "Agriculture",
    keywords: [
      "agriculture", "farming", "crop", "livestock", "aquaculture", "agritech",
      "sustainable", "organic", "food production", "commodity", "irrigation",
      "machinery", "seed", "fertilizer", "harvest", "supply chain",
      "agricultural technology", "farm management", "food processing"
    ],
    sectors: [
      "Crop Farming", "Livestock", "Aquaculture", "AgriTech",
      "Food Processing", "Sustainable Agriculture", "Organic Farming", "Equipment",
      "Agricultural Services", "Food Production", "Farm Management"
    ],
    priority: 3,
    description: "Industry focused on farming, food production, and agricultural technology"
  },
  {
    name: "Legal",
    keywords: [
      "legal", "law", "attorney", "lawyer", "paralegal", "litigation",
      "corporate law", "intellectual property", "contract", "compliance", "regulatory",
      "patent", "trademark", "copyright", "dispute resolution", "legal research",
      "legal services", "corporate law", "intellectual property law"
    ],
    sectors: [
      "Corporate Law", "Intellectual Property", "Litigation", "Compliance",
      "Patent Law", "Contract Law", "Regulatory Law", "Legal Services",
      "Family Law", "Criminal Law", "Immigration Law", "Tax Law"
    ],
    priority: 1,
    description: "Industry focused on legal services, compliance, and regulatory matters"
  },
  {
    name: "Non-Profit",
    keywords: [
      "non-profit", "charity", "foundation", "ngo", "social impact", "philanthropy",
      "fundraising", "grant making", "social services", "community development",
      "advocacy", "public benefit", "volunteer management", "program management",
      "social justice", "environmental conservation", "humanitarian"
    ],
    sectors: [
      "Social Services", "Environmental Conservation", "Education", "Healthcare",
      "Arts & Culture", "International Development", "Animal Welfare",
      "Community Development", "Human Rights", "Disaster Relief"
    ],
    priority: 3,
    description: "Industry focused on charitable organizations and social impact initiatives"
  }
];

// Helper functions for industry matching and suggestions
export const getAllIndustries = (): string[] => {
  return INDUSTRIES.map(industry => industry.name);
};

export const getIndustryByName = (name: string): Industry | undefined => {
  return INDUSTRIES.find(industry => 
    industry.name.toLowerCase() === name.toLowerCase()
  );
};

export const searchIndustries = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return getAllIndustries().filter(industry => 
    industry.toLowerCase().includes(lowerQuery) || 
    lowerQuery.includes(industry.toLowerCase().substring(0, Math.min(lowerQuery.length, 3)))
  ).slice(0, 10);
};

export const getKeywordsForIndustry = (industry: string): string[] => {
  const found = getIndustryByName(industry);
  return found ? found.keywords : [];
};

export const getSectorsForIndustry = (industry: string): string[] => {
  const found = getIndustryByName(industry);
  return found ? found.sectors : [];
};

export const getIndustryDescription = (industry: string): string => {
  const found = getIndustryByName(industry);
  return found ? found.description : "";
};

export const getHighPriorityIndustries = (): string[] => {
  return INDUSTRIES
    .filter(industry => industry.priority === 1)
    .map(industry => industry.name);
};
