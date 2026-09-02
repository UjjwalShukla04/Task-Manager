import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRepository, PublicUser } from "../repositories/user.repository";
import { RegisterInput, LoginInput } from "../dto/auth.dto";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

const userRepository = new UserRepository();

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return { user, token: this.generateToken(user.id) };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmailWithPassword(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError("Invalid credentials", 401);
    }

    const { password: _password, updatedAt: _updatedAt, ...publicUser } = user;
    return { user: publicUser, token: this.generateToken(user.id) };
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async getAllUsers() {
    return userRepository.findAll();
  }

  private generateToken(userId: string) {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    });
  }
}
