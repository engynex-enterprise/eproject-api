import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

/**
 * Validates that the org_id or orgId route parameter is a valid UUID.
 */
@Injectable()
export class ParseOrgIdPipe implements PipeTransform<string, string> {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Organization ID is required');
    }

    if (!ParseOrgIdPipe.UUID_REGEX.test(value)) {
      throw new BadRequestException(
        `Invalid organization ID format: "${value}". Expected a valid UUID.`,
      );
    }

    return value;
  }
}
