/**
 * Skills Ontology and Role Mapping
 * Expandable dataset for Resume Intelligence Engine
 */

export interface SkillInfo {
  canonical: string;
  aliases: string[];
  category: string;
}

export const SKILLS_ONTOLOGY: SkillInfo[] = [
  // Cybersecurity
  { canonical: "SIEM", aliases: ["security information and event management", "log management"], category: "Cybersecurity" },
  { canonical: "Splunk", aliases: ["splunk enterprise", "splunk cloud"], category: "Cybersecurity" },
  { canonical: "MITRE ATT&CK", aliases: ["mitre", "attack framework"], category: "Cybersecurity" },
  { canonical: "Threat Hunting", aliases: ["threat detection", "proactive hunting"], category: "Cybersecurity" },
  { canonical: "Wireshark", aliases: ["packet analysis", "network sniffing"], category: "Cybersecurity" },
  { canonical: "SOC", aliases: ["security operations center", "security operations"], category: "Cybersecurity" },
  { canonical: "Incident Response", aliases: ["ir", "incident handling"], category: "Cybersecurity" },
  { canonical: "Penetration Testing", aliases: ["pentesting", "pen testing", "ethical hacking"], category: "Cybersecurity" },

  // Software Engineering
  { canonical: "Kubernetes", aliases: ["k8s", "container orchestration"], category: "Engineering" },
  { canonical: "Docker", aliases: ["containers", "docker engine"], category: "Engineering" },
  { canonical: "React", aliases: ["react.js", "reactjs"], category: "Engineering" },
  { canonical: "Node.js", aliases: ["nodejs", "node"], category: "Engineering" },
  { canonical: "TypeScript", aliases: ["ts"], category: "Engineering" },
  { canonical: "Python", aliases: ["py"], category: "Engineering" },
  { canonical: "AWS", aliases: ["amazon web services"], category: "Engineering" },

  // Business & Management
  { canonical: "Project Management", aliases: ["pmp", "project lead"], category: "Business" },
  { canonical: "Agile", aliases: ["scrum", "kanban", "safe"], category: "Business" },
  { canonical: "Strategic Planning", aliases: ["strategy", "long-term planning"], category: "Business" },
];

export interface RoleSkillMap {
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

export const ROLE_SKILL_MAP: RoleSkillMap[] = [
  {
    role: "Cybersecurity Analyst",
    requiredSkills: ["SIEM", "SOC", "Incident Response", "Network Security"],
    preferredSkills: ["Splunk", "MITRE ATT&CK", "Threat Hunting", "Wireshark"]
  },
  {
    role: "Frontend Developer",
    requiredSkills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3"],
    preferredSkills: ["Next.js", "Tailwind CSS", "Redux", "Testing Library"]
  },
  {
    role: "DevOps Engineer",
    requiredSkills: ["Docker", "Kubernetes", "CI/CD", "AWS"],
    preferredSkills: ["Terraform", "Ansible", "Jenkins", "Prometheus"]
  }
];
