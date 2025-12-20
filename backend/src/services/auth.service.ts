import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { RegisterInput, LoginInput } from "../dto/auth.dto";
import { AppError } from "../utils/AppError";

const userRepository = new UserRepository();

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  private generateToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
  }

  async getAllUsers() {
    return userRepository.findAll();
  }
}
