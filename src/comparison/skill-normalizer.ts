export class SkillNormalizer {
  private readonly aliases: Record<string, string> = {
    react: 'React',
    'react.js': 'React',
    reactjs: 'React',
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    node: 'Node.js',
    nodejs: 'Node.js',
    'node.js': 'Node.js',
    docker: 'Docker',
    aws: 'AWS',
    mongodb: 'MongoDB',
    sql: 'SQL',
    nestjs: 'NestJS',
    'rest api': 'REST API',
    'rest apis': 'REST API',
    python: 'Python',
    java: 'Java',
    'c#': 'C#',
    'c-sharp': 'C#',
    postgres: 'PostgreSQL',
    postgresql: 'PostgreSQL',
    'full stack': 'Full Stack',
  };

  normalize(skill: string): string {
    const trimmed = skill.trim();
    if (!trimmed) {
      return '';
    }

    const lowered = trimmed.toLowerCase();
    const direct = this.aliases[lowered];
    if (direct) {
      return direct;
    }

    const cleaned = lowered
      .replace(/[\s_]+/g, ' ')
      .replace(/[^a-z0-9+.\-/ ]/g, '')
      .trim();

    return cleaned
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
      .replace(/\s+(?=[A-Za-z])/g, ' ')
      .replace(/\bJs\b/gi, 'JS')
      .replace(/\bApi\b/gi, 'API')
      .replace(/\bSql\b/gi, 'SQL')
      .replace(/\bAws\b/gi, 'AWS')
      .replace(/\bNode\b/gi, 'Node');
  }

  matches(left: string, right: string): boolean {
    const normalizedLeft = this.normalize(left);
    const normalizedRight = this.normalize(right);

    if (!normalizedLeft || !normalizedRight) {
      return false;
    }

    return (
      normalizedLeft === normalizedRight ||
      normalizedLeft.includes(normalizedRight) ||
      normalizedRight.includes(normalizedLeft) ||
      normalizedLeft.replace(/[^a-z0-9]/gi, '') === normalizedRight.replace(/[^a-z0-9]/gi, '')
    );
  }
}
