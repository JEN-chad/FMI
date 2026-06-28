import { User, Role } from "@prisma/client";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import { CreateUserDTO, UpdateUserDTO, CreateUserSchema, UpdateUserSchema } from "@/lib/dto/user.dto";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { PrismaTx } from "@/lib/db/prisma";

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Registers a new user on the platform
   */
  async registerUser(dto: CreateUserDTO, tx?: PrismaTx): Promise<User> {
    // Validate inputs
    const validated = CreateUserSchema.parse(dto);

    // Check for duplicate email
    const existingEmail = await this.userRepo.findByEmail(validated.email, tx);
    if (existingEmail) {
      throw new ConflictError("A user with this email address already exists");
    }

    // Check for duplicate phone
    if (validated.phoneNumber) {
      const existingPhone = await this.userRepo.findByPhoneNumber(validated.phoneNumber, tx);
      if (existingPhone) {
        throw new ConflictError("A user with this phone number already exists");
      }
    }

    return this.userRepo.create(validated, tx);
  }

  /**
   * Updates user details
   */
  async updateUser(userId: string, dto: UpdateUserDTO, tx?: PrismaTx): Promise<User> {
    const validated = UpdateUserSchema.parse(dto);

    // Verify user exists
    const user = await this.userRepo.findById(userId, tx);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // If email is changing (though usually read-only, check if provided)
    if (validated.phoneNumber && validated.phoneNumber !== user.phoneNumber) {
      const existingPhone = await this.userRepo.findByPhoneNumber(validated.phoneNumber, tx);
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictError("Phone number is already taken by another account");
      }
    }

    return this.userRepo.update(userId, validated, tx);
  }

  /**
   * Retrieves a user by their ID
   */
  async getUserById(userId: string, tx?: PrismaTx): Promise<User> {
    const user = await this.userRepo.findById(userId, tx);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  /**
   * Selects or updates a user's role (buyer/seller/both/admin)
   */
  async selectRole(userId: string, role: Role, tx?: PrismaTx): Promise<User> {
    if (role === Role.ADMIN) {
      throw new ValidationError("Cannot manually assign admin role");
    }
    return this.updateUser(userId, { role }, tx);
  }
}

export const userService = new UserService(userRepository);
