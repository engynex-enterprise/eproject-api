import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

/**
 * Validates that a project key follows the expected format:
 * 2-10 uppercase alphanumeric characters (e.g., "TSD", "PROJ1", "EP").
 */
@Injectable()
export class ParseProjectKeyPipe implements PipeTransform<string, string> {
  private static readonly PROJECT_KEY_REGEX = /^[A-Z][A-Z0-9]{1,9}$/;

  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Project key is required');
    }

    const upperValue = value.toUpperCase();

    if (!ParseProjectKeyPipe.PROJECT_KEY_REGEX.test(upperValue)) {
      throw new BadRequestException(
        `Invalid project key format: "${value}". ` +
          'Expected 2-10 uppercase alphanumeric characters starting with a letter (e.g., "TSD", "PROJ1").',
      );
    }

    return upperValue;
  }
}
