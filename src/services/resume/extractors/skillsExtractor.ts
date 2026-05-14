/**
 * Atomic skill extraction with normalization and aliases.
 */

interface SkillDefinition {
  canonical: string;
  aliases: string[];
}

const SKILL_DATASET: SkillDefinition[] = [
  // Frontend
  { canonical: "React", aliases: ["react.js", "reactjs", "react js"] },
  { canonical: "Vue.js", aliases: ["vue", "vuejs", "vue.js"] },
  { canonical: "Angular", aliases: ["angular.js", "angularjs"] },
  { canonical: "Next.js", aliases: ["nextjs", "next js"] },
  { canonical: "TypeScript", aliases: ["ts"] },
  { canonical: "JavaScript", aliases: ["js", "es6", "esnext"] },
  { canonical: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"] },
  { canonical: "Redux", aliases: ["redux-thunk", "redux-saga"] },
  { canonical: "Svelte", aliases: ["sveltejs"] },
  { canonical: "Webpack", aliases: ["webpack.js"] },
  { canonical: "Vite", aliases: [] },
  { canonical: "Three.js", aliases: ["threejs"] },
  { canonical: "HTML5", aliases: ["html"] },
  { canonical: "CSS3", aliases: ["css", "scss", "sass", "less"] },

  // Backend
  { canonical: "Node.js", aliases: ["nodejs", "node js", "node.js"] },
  { canonical: "Express", aliases: ["express.js", "expressjs"] },
  { canonical: "Python", aliases: ["py"] },
  { canonical: "Django", aliases: [] },
  { canonical: "Flask", aliases: [] },
  { canonical: "FastAPI", aliases: [] },
  { canonical: "Go", aliases: ["golang"] },
  { canonical: "Rust", aliases: [] },
  { canonical: "Java", aliases: [] },
  { canonical: "Spring Boot", aliases: ["spring"] },
  { canonical: "Ruby on Rails", aliases: ["rails", "ruby"] },
  { canonical: "PHP", aliases: ["laravel", "symfony"] },
  { canonical: "C#", aliases: ["csharp", ".net", "dotnet"] },
  { canonical: "C++", aliases: ["cpp"] },

  // Cybersecurity
  { canonical: "SIEM", aliases: ["security information and event management"] },
  { canonical: "Splunk", aliases: [] },
  { canonical: "Wireshark", aliases: [] },
  { canonical: "Nmap", aliases: [] },
  { canonical: "Metasploit", aliases: [] },
  { canonical: "Burp Suite", aliases: ["burpsuite"] },
  { canonical: "Penetration Testing", aliases: ["pentesting", "pentest", "pen-testing"] },
  { canonical: "Vulnerability Assessment", aliases: ["vulnerability scanning"] },
  { canonical: "Incident Response", aliases: ["ir"] },
  { canonical: "EDR", aliases: ["endpoint detection and response"] },
  { canonical: "Threat Hunting", aliases: [] },
  { canonical: "CrowdStrike", aliases: [] },
  { canonical: "SentinelOne", aliases: [] },
  { canonical: "Firewalls", aliases: ["palo alto", "fortinet", "checkpoint"] },
  { canonical: "IDS/IPS", aliases: ["intrusion detection", "intrusion prevention"] },
  { canonical: "Kali Linux", aliases: ["kali"] },

  // DevOps & Cloud
  { canonical: "Docker", aliases: [] },
  { canonical: "Kubernetes", aliases: ["k8s"] },
  { canonical: "Terraform", aliases: ["iac"] },
  { canonical: "Ansible", aliases: [] },
  { canonical: "AWS", aliases: ["amazon web services", "ec2", "s3", "lambda"] },
  { canonical: "Azure", aliases: ["microsoft azure"] },
  { canonical: "GCP", aliases: ["google cloud platform", "google cloud"] },
  { canonical: "Jenkins", aliases: [] },
  { canonical: "GitHub Actions", aliases: ["github actions"] },
  { canonical: "CI/CD", aliases: ["continuous integration", "continuous deployment"] },
  { canonical: "Prometheus", aliases: [] },
  { canonical: "Grafana", aliases: [] },
  { canonical: "Linux", aliases: ["ubuntu", "debian", "centos", "rhel"] },

  // Data Science & AI
  { canonical: "Machine Learning", aliases: ["ml"] },
  { canonical: "Deep Learning", aliases: ["dl"] },
  { canonical: "Artificial Intelligence", aliases: ["ai"] },
  { canonical: "NLP", aliases: ["natural language processing"] },
  { canonical: "Computer Vision", aliases: ["cv"] },
  { canonical: "PyTorch", aliases: [] },
  { canonical: "TensorFlow", aliases: ["tf"] },
  { canonical: "Scikit-learn", aliases: ["sklearn"] },
  { canonical: "Pandas", aliases: [] },
  { canonical: "NumPy", aliases: [] },
  { canonical: "LLM", aliases: ["large language models", "gpt", "transformers"] },
  { canonical: "LangChain", aliases: [] },
  { canonical: "HuggingFace", aliases: [] },
  { canonical: "Data Visualization", aliases: ["tableau", "power bi", "powerbi"] },

  // Databases
  { canonical: "PostgreSQL", aliases: ["postgres", "postgresql"] },
  { canonical: "MongoDB", aliases: ["mongo"] },
  { canonical: "MySQL", aliases: ["mysql"] },
  { canonical: "Redis", aliases: [] },
  { canonical: "Elasticsearch", aliases: ["elk"] },
  { canonical: "DynamoDB", aliases: [] },
  { canonical: "Firebase", aliases: [] },
  { canonical: "Supabase", aliases: [] },
  { canonical: "SQLite", aliases: [] },
  { canonical: "Cassandra", aliases: [] },

  // Networking
  { canonical: "TCP/IP", aliases: [] },
  { canonical: "DNS", aliases: [] },
  { canonical: "VPN", aliases: [] },
  { canonical: "VPC", aliases: [] },
  { canonical: "BGP", aliases: [] },
  { canonical: "SD-WAN", aliases: [] },

  // Mobile
  { canonical: "React Native", aliases: [] },
  { canonical: "Flutter", aliases: [] },
  { canonical: "Swift", aliases: ["ios"] },
  { canonical: "Kotlin", aliases: ["android"] },
  { canonical: "Ionic", aliases: [] },

  // Others
  { canonical: "GraphQL", aliases: [] },
  { canonical: "REST API", aliases: ["restful", "apis"] },
  { canonical: "Microservices", aliases: [] },
  { canonical: "System Design", aliases: ["architecture"] },
  { canonical: "Agile", aliases: ["scrum", "kanban"] },
  { canonical: "Git", aliases: ["github", "gitlab", "bitbucket"] },
  { canonical: "Jira", aliases: [] },
  { canonical: "Unit Testing", aliases: ["jest", "mocha", "chai"] },
  { canonical: "Cypress", aliases: ["e2e testing"] },
  { canonical: "Playwright", aliases: [] },
  { canonical: "GraphQL", aliases: ["apollo", "relay"] },
  { canonical: "Prisma", aliases: ["orm"] },
  { canonical: "Sequelize", aliases: [] },
  { canonical: "TypeORM", aliases: [] },
  { canonical: "Zod", aliases: ["validation"] },
  { canonical: "React Query", aliases: ["tanstack query"] },
  { canonical: "Zustand", aliases: [] },
  { canonical: "MobX", aliases: [] },
  { canonical: "Webpack", aliases: ["webpack.js"] },
  { canonical: "Babel", aliases: [] },
  { canonical: "Rollup", aliases: [] },
  { canonical: "Parcel", aliases: [] },
  { canonical: "Esbuild", aliases: [] },
  { canonical: "NX", aliases: ["monorepo"] },
  { canonical: "Turborepo", aliases: [] },
  { canonical: "Lerna", aliases: [] },
  { canonical: "Micro Frontends", aliases: [] },
  { canonical: "Serverless", aliases: ["lambda functions", "azure functions"] },
  { canonical: "IAM", aliases: ["identity and access management"] },
  { canonical: "OAuth2", aliases: ["oidc", "auth0"] },
  { canonical: "JWT", aliases: ["json web tokens"] },
  { canonical: "WebSockets", aliases: ["socket.io"] },
  { canonical: "WebRTC", aliases: [] },
  { canonical: "WASM", aliases: ["webassembly"] },
  { canonical: "VPC", aliases: ["virtual private cloud"] },
  { canonical: "CDN", aliases: ["cloudfront", "cloudflare"] },
  { canonical: "DNS", aliases: ["route53"] },
  { canonical: "Bash", aliases: ["shell scripting", "sh"] },
  { canonical: "PowerShell", aliases: [] },
  { canonical: "Terraform", aliases: ["iac", "hcl"] },
  { canonical: "CloudFormation", aliases: [] },
  { canonical: "Pulumi", aliases: [] },
  { canonical: "Docker Swarm", aliases: [] },
  { canonical: "Istio", aliases: ["service mesh"] },
  { canonical: "Helm", aliases: [] },
  { canonical: "CircleCI", aliases: [] },
  { canonical: "Travis CI", aliases: [] },
  { canonical: "Bitbucket Pipelines", aliases: [] },
  { canonical: "Sentry", aliases: ["error tracking"] },
  { canonical: "LogRocket", aliases: [] },
  { canonical: "New Relic", aliases: [] },
  { canonical: "Datadog", aliases: [] },
  { canonical: "Splunk", aliases: ["siem"] },
  { canonical: "ELK Stack", aliases: ["elasticsearch", "logstash", "kibana"] },
  { canonical: "Segment", aliases: [] },
  { canonical: "Mixpanel", aliases: [] },
  { canonical: "Amplitude", aliases: [] },
  { canonical: "Google Analytics", aliases: ["ga4"] },
  { canonical: "Postman", aliases: [] },
  { canonical: "Insomnia", aliases: [] },
  { canonical: "Swagger", aliases: ["openapi"] },
  { canonical: "Storybook", aliases: [] },
  { canonical: "Figma", aliases: ["ui design", "ux design"] },
  { canonical: "Adobe XD", aliases: [] },
  { canonical: "InVision", aliases: [] },
  { canonical: "Zeplin", aliases: [] },
  { canonical: "Miro", aliases: [] },
  { canonical: "Slack", aliases: [] },
  { canonical: "Microsoft Teams", aliases: [] },
  { canonical: "Zoom", aliases: [] },
  { canonical: "Trello", aliases: [] },
  { canonical: "Asana", aliases: [] },
  { canonical: "Monday.com", aliases: [] },
  { canonical: "Notion", aliases: [] },
  { canonical: "Confluence", aliases: [] },
  { canonical: "Google Cloud Run", aliases: [] },
  { canonical: "AWS Fargate", aliases: [] },
  { canonical: "EKS", aliases: [] },
  { canonical: "GKE", aliases: [] },
  { canonical: "AKS", aliases: [] },
  { canonical: "S3", aliases: ["amazon s3"] },
  { canonical: "RDS", aliases: ["amazon rds"] },
  { canonical: "Lambda", aliases: ["aws lambda"] },
  { canonical: "CloudFront", aliases: [] },
  { canonical: "API Gateway", aliases: [] },
  { canonical: "SQS", aliases: [] },
  { canonical: "SNS", aliases: [] },
  { canonical: "Kinesis", aliases: [] },
  { canonical: "DynamoDB", aliases: [] },
  { canonical: "Redshift", aliases: [] },
  { canonical: "BigQuery", aliases: [] },
  { canonical: "Snowflake", aliases: [] },
  { canonical: "Databricks", aliases: [] },
  { canonical: "Airflow", aliases: [] },
  { canonical: "Kafka", aliases: [] },
  { canonical: "Spark", aliases: [] },
  { canonical: "Hadoop", aliases: [] },
  { canonical: "Hive", aliases: [] },
  { canonical: "Tableau", aliases: [] },
  { canonical: "Power BI", aliases: [] },
  { canonical: "Looker", aliases: [] },
  { canonical: "D3.js", aliases: [] },
  { canonical: "Chart.js", aliases: [] },
  { canonical: "Highcharts", aliases: [] },
  { canonical: "Recharts", aliases: [] },
];

export function extractSkills(text: string): string[] {
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  SKILL_DATASET.forEach(skill => {
    const patterns = [skill.canonical.toLowerCase(), ...skill.aliases.map(a => a.toLowerCase())];

    for (const pattern of patterns) {
      // Escape pattern for regex
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, "i");

      if (regex.test(lowerText)) {
        foundSkills.add(skill.canonical);
        break;
      }
    }
  });

  return Array.from(foundSkills);
}
