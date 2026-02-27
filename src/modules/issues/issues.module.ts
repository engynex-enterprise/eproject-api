import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller.js';
import { IssuesService } from './issues.service.js';
import { IssueKeyService } from './issue-key.service.js';

@Module({
  controllers: [IssuesController],
  providers: [IssuesService, IssueKeyService],
  exports: [IssuesService, IssueKeyService],
})
export class IssuesModule {}
