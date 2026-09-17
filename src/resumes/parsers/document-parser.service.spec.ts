import { BadRequestException } from '@nestjs/common';
import { DocumentParserService } from './document-parser.service';

describe('DocumentParserService', () => {
  it('rejects unsupported file signatures before parsing', async () => {
    const service = new DocumentParserService();

    await expect(service.extract(Buffer.from('<script>alert(1)</script>'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
