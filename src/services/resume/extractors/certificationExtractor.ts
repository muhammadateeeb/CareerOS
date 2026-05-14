/**
 * Extracts certifications from resume text.
 */

const CERT_PATTERNS = [
  { canonical: "AWS Certified Solutions Architect", patterns: [/AWS\s*Certified\s*Solutions\s*Architect/i, /AWS\s*Solutions\s*Architect/i, /AWS-SAA/i] },
  { canonical: "AWS Certified Developer", patterns: [/AWS\s*Certified\s*Developer/i, /AWS-DVA/i] },
  { canonical: "AWS Certified SysOps", patterns: [/AWS\s*Certified\s*SysOps/i, /AWS-SOA/i] },
  { canonical: "Azure Fundamentals", patterns: [/Azure\s*Fundamentals/i, /AZ-900/i] },
  { canonical: "Azure Administrator", patterns: [/Azure\s*Administrator/i, /AZ-104/i] },
  { canonical: "Google Cloud Professional", patterns: [/Google\s*Cloud\s*Professional/i, /GCP\s*Professional/i] },
  { canonical: "CompTIA Security+", patterns: [/Security\+/i, /Security\s*Plus/i] },
  { canonical: "CompTIA Network+", patterns: [/Network\+/i, /Network\s*Plus/i] },
  { canonical: "CompTIA A+", patterns: [/A\+/i, /CompTIA\s*A\+/i] },
  { canonical: "CEH", patterns: [/Certified\s*Ethical\s*Hacker/i, /CEH/i] },
  { canonical: "OSCP", patterns: [/Offensive\s*Security\s*Certified\s*Professional/i, /OSCP/i] },
  { canonical: "CISSP", patterns: [/Certified\s*Information\s*Systems\s*Security\s*Professional/i, /CISSP/i] },
  { canonical: "CKA", patterns: [/Certified\s*Kubernetes\s*Administrator/i, /CKA/i] },
  { canonical: "CKAD", patterns: [/Certified\s*Kubernetes\s*Application\s*Developer/i, /CKAD/i] },
  { canonical: "PMP", patterns: [/Project\s*Management\s*Professional/i, /PMP/i] },
  { canonical: "CCNA", patterns: [/Cisco\s*Certified\s*Network\s*Associate/i, /CCNA/i] },
  { canonical: "CCNP", patterns: [/Cisco\s*Certified\s*Network\s*Professional/i, /CCNP/i] },
];

export function extractCertifications(text: string): string[] {
  const found = new Set<string>();

  CERT_PATTERNS.forEach(cert => {
    for (const pattern of cert.patterns) {
      if (pattern.test(text)) {
        found.add(cert.canonical);
        break;
      }
    }
  });

  // Also catch generic "Certified X" or "X Certification"
  const genericRegex = /([A-Z][a-zA-Z]+\s?){1,3}(Certification|Certified)/g;
  const matches = text.match(genericRegex) || [];
  matches.forEach(m => {
    if (m.length > 5 && m.length < 50) {
      found.add(m.trim());
    }
  });

  return Array.from(found);
}
