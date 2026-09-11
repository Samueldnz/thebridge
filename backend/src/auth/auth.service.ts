import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../database/prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          profileType: dto.profileType,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileType: true,
          systemRole: true,
          status: true,
          profileCompleted: true,
          createdAt: true,
        },
      });

      const accessToken = await this.createAccessToken(user);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Email already registered');
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileType: user.profileType,
      systemRole: user.systemRole,
      status: user.status,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
    };

    const accessToken = await this.createAccessToken(publicUser);

    return {
      accessToken,
      user: publicUser,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        profileType: true,
        systemRole: true,
        status: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }

  private async createAccessToken(user: {
    id: string;
    email: string;
    profileType: string;
    systemRole: string;
  }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      profileType: user.profileType,
      systemRole: user.systemRole,
    });
  }
}