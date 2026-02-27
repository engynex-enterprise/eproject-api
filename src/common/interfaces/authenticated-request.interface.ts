import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  orgId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  orgId?: string;
  orgRole?: string;
  projectRole?: string;
  permissions?: string[];
  ability?: any; // CASL Ability instance
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  orgId?: string;
  orgRole?: string;
  orgMembership?: any;
  projectRole?: string;
  projectMembership?: any;
}
