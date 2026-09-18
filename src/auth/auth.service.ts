import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { USER_STORE } from './user.store';
import type { UserStore } from './user.store';
import type { AuthUser, UserRecord } from './auth.types';

@Injectable()
export class AuthService {
  private readonly secret = process.env.AUTH_SECRET ?? 'career-match-development-secret';

  constructor(@Inject(USER_STORE) private readonly userStore: UserStore) {}

  async register(emailInput?: string, password?: string) {
    const email = this.normalizeEmail(emailInput);
    this.validatePassword(password);
    if (await this.userStore.findByEmail(email)) throw new ConflictException('An account with this email already exists.');

    const user: UserRecord = { id: randomUUID(), email, passwordHash: this.hashPassword(password!), createdAt: new Date().toISOString() };
    await this.userStore.create(user);
    return this.authResponse(user);
  }

  async login(emailInput?: string, password?: string) {
    const email = this.normalizeEmail(emailInput);
    const user = await this.userStore.findByEmail(email);
    if (!user || !this.verifyPassword(password ?? '', user.passwordHash)) throw new UnauthorizedException('Invalid email or password.');
    return this.authResponse(user);
  }

  async verifyToken(token: string): Promise<AuthUser> {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) throw new UnauthorizedException('Invalid authentication token.');
    const expected = this.sign(encodedPayload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Invalid authentication token.');
    }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as { userId: string; exp: number };
    if (payload.exp < Date.now()) throw new UnauthorizedException('Authentication token expired.');
    const user = await this.userStore.findById(payload.userId);
    if (!user) throw new UnauthorizedException('Account not found.');
    return { id: user.id, email: user.email };
  }

  private authResponse(user: UserRecord) {
    const payload = Buffer.from(JSON.stringify({ userId: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
    return { token: `${payload}.${this.sign(payload)}`, user: { id: user.id, email: user.email } };
  }

  private sign(payload: string) { return createHmac('sha256', this.secret).update(payload).digest('base64url'); }
  private hashPassword(password: string) { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`; }
  private verifyPassword(password: string, stored: string) { const [salt, hash] = stored.split(':'); return !!salt && !!hash && timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64)); }
  private normalizeEmail(email?: string) { const normalized = email?.trim().toLowerCase(); if (!normalized || !normalized.includes('@')) throw new UnauthorizedException('A valid email is required.'); return normalized; }
  private validatePassword(password?: string) { if (!password || password.length < 8) throw new UnauthorizedException('Password must be at least 8 characters.'); }
}
