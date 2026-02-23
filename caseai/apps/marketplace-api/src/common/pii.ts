import { BadRequestException } from '@nestjs/common';

const piiPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /\+?\d[\d\s().-]{7,}\d/g,
  /\b\d{1,5}\s+[A-Za-z0-9\s]{2,}\s(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Boulevard|Blvd)\b/gi
];

export function assertNoPii(input: string, fieldName: string) {
  for (const pattern of piiPatterns) {
    if (pattern.test(input)) {
      throw new BadRequestException(`${fieldName} appears to contain PII and is not allowed`);
    }
  }
}
