import { Role } from "../types/resume.types";

export const ROLES: Role[] = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    keywords: ["React", "TypeScript", "Tailwind", "Next.js", "Redux", "GraphQL", "Web Performance", "Accessibility"],
    preferredSkills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Vite", "Testing Library"],
    atsRequirements: ["Strong React background", "Proficient in TypeScript", "Modern CSS frameworks"],
    interviewTopics: ["React Lifecycle", "Hooks", "State Management", "DOM manipulation", "Performance optimization"]
  },
  {
    id: "backend-dev",
    title: "Backend Developer",
    keywords: ["Node.js", "Python", "PostgreSQL", "Redis", "Microservices", "Docker", "API Design", "gRPC"],
    preferredSkills: ["Node.js", "Express", "Python", "Django", "Go", "PostgreSQL", "MongoDB", "Redis", "RabbitMQ"],
    atsRequirements: ["Distributed systems knowledge", "Database optimization", "API security"],
    interviewTopics: ["Database Indexing", "Concurrency", "System Design", "Security", "Scalability"]
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    keywords: ["React", "Node.js", "TypeScript", "Full Stack", "SQL", "Cloud", "System Architecture", "DevOps"],
    preferredSkills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js", "Prisma", "AWS", "CI/CD"],
    atsRequirements: ["End-to-end development", "Frontend and Backend proficiency", "Database management"],
    interviewTopics: ["Client-server architecture", "Data modeling", "Full-stack debugging", "Auth flows"]
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    keywords: ["SIEM", "SOC", "Incident Response", "Threat Hunting", "Splunk", "NIST", "OWASP", "Network Security"],
    preferredSkills: ["SIEM", "Splunk", "Wireshark", "Firewalls", "IDS/IPS", "Vulnerability Scanning", "Penetration Testing"],
    atsRequirements: ["Security framework knowledge", "Incident handling experience", "Network protocols"],
    interviewTopics: ["TCP/IP", "Common attacks (SQLi, XSS)", "Encryption", "SOC workflows", "Forensics"]
  },
  {
    id: "soc-analyst",
    title: "SOC Analyst",
    keywords: ["Log Analysis", "Alert Monitoring", "SOC", "EDR", "Splunk", "CrowdStrike", "Threat Intel", "SIEM"],
    preferredSkills: ["Splunk", "QRadar", "CrowdStrike", "Wireshark", "Phishing Analysis", "Packet Analysis"],
    atsRequirements: ["Monitoring tools proficiency", "Fast response times", "Detail-oriented analysis"],
    interviewTopics: ["Log sources", "Triage process", "Network layers", "Incident classification"]
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    keywords: ["Kubernetes", "Docker", "Terraform", "CI/CD", "AWS", "Infrastructure as Code", "Monitoring", "Automation"],
    preferredSkills: ["Kubernetes", "Docker", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Prometheus", "Grafana"],
    atsRequirements: ["Cloud platform certification", "Container orchestration", "IaC expertise"],
    interviewTopics: ["Pipeline design", "Infrastructure scaling", "Container security", "Observability"]
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    keywords: ["SQL", "Python", "Tableau", "Power BI", "Data Visualization", "Statistics", "ETL", "Excel"],
    preferredSkills: ["SQL", "Python", "Tableau", "Power BI", "Pandas", "NumPy", "Data Cleaning", "A/B Testing"],
    atsRequirements: ["Data storytelling", "Statistical analysis", "Advanced SQL"],
    interviewTopics: ["Joins", "Aggregations", "Data cleaning techniques", "Visualization principles"]
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    keywords: ["Machine Learning", "PyTorch", "NLP", "LLM", "Deep Learning", "Transformers", "Computer Vision", "MLOps"],
    preferredSkills: ["PyTorch", "TensorFlow", "NLP", "LangChain", "OpenAI", "HuggingFace", "Python", "Model Deployment"],
    atsRequirements: ["Deep learning experience", "Model evaluation metrics", "Large language models"],
    interviewTopics: ["Gradient Descent", "Neural Network architectures", "LLM Fine-tuning", "Vector Databases"]
  },
  {
    id: "uiux-designer",
    title: "UI/UX Designer",
    keywords: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "Visual Design", "Accessibility"],
    preferredSkills: ["Figma", "Sketch", "Adobe Creative Suite", "User Personas", "Usability Testing", "Interaction Design"],
    atsRequirements: ["Portfolio availability", "User-centric design approach", "Prototyping skills"],
    interviewTopics: ["Design process", "Accessibility (WCAG)", "Usability principles", "Critique and iteration"]
  }
];
