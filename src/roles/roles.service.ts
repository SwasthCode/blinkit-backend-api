import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { BaseService } from '../common/base/base.service';
import { RoleType } from '../common/utils/enum';

@Injectable()
export class RolesService extends BaseService<RoleDocument> {
  constructor(@InjectModel(Role.name) roleModel: Model<RoleDocument>) {
    super(roleModel);
  }

  /**
   * Override create method to auto-generate key, role_id, and role_type
   * @param createRoleDto - Role data
   * @returns Promise<RoleDocument> - Created role
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    try {
      // Check for duplicate name
      const existingName = await this.model
        .findOne({ name: createRoleDto.name })
        .exec();
      if (existingName) {
        throw new ConflictException(
          `Role with name '${createRoleDto.name}' already exists`,
        );
      }

      // Generate key from name (lowercase, replace spaces with underscores)
      const key = createRoleDto.name.toLowerCase().replace(/\s+/g, '_');

      // Check for duplicate key
      const existingKey = await this.model.findOne({ key }).exec();
      if (existingKey) {
        throw new ConflictException(`Role with key '${key}' already exists`);
      }

      // Get the next role_id
      const lastRole = await this.model.findOne().sort({ role_id: -1 }).exec();
      const role_id = lastRole ? lastRole.role_id + 1 : 1;

      // role_type is the same as role_id
      const role_type = role_id;

      // Create role data
      const roleData = {
        name: createRoleDto.name,
        key,
        role_id,
        role_type,
      };

      // Create and save the role
      const created = new this.model(roleData);
      return created.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create role: ${errorMessage}`);
    }
  }

  /**
   * Override update method to check for duplicates
   * @param id - Role MongoDB ID
   * @param updateRoleDto - Role data to update
   * @returns Promise<RoleDocument> - Updated role
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDocument> {
    try {
      const existingRole = await this.model.findById(id).exec();
      if (!existingRole) {
        throw new Error(`Role not found with ID: ${id}`);
      }

      const updateData = updateRoleDto as Partial<RoleDocument>;

      // Check for duplicate key (excluding current role)
      if (
        updateData.key &&
        typeof updateData.key === 'string' &&
        updateData.key !== existingRole.key
      ) {
        const existingKey = await this.model
          .findOne({ key: updateData.key })
          .exec();
        if (existingKey) {
          throw new ConflictException(
            `Role with key '${updateData.key}' already exists`,
          );
        }
      }

      // Check for duplicate role_id (excluding current role)
      if (
        updateData.role_id &&
        typeof updateData.role_id === 'number' &&
        updateData.role_id !== existingRole.role_id
      ) {
        const existingId = await this.model
          .findOne({ role_id: updateData.role_id })
          .exec();
        if (existingId) {
          throw new ConflictException(
            `Role with role_id '${updateData.role_id}' already exists`,
          );
        }
      }

      // Check for duplicate name and regenerate key if name changes
      if (
        updateData.name &&
        typeof updateData.name === 'string' &&
        updateData.name !== existingRole.name
      ) {
        const existingName = await this.model
          .findOne({ name: updateData.name })
          .exec();
        if (existingName) {
          throw new ConflictException(
            `Role with name '${updateData.name}' already exists`,
          );
        }
        // Generate new key from new name
        const newKey = updateData.name.toLowerCase().replace(/\s+/g, '_');
        updateData.key = newKey;

        // Check for duplicate key
        const existingKey = await this.model.findOne({ key: newKey }).exec();
        if (existingKey) {
          throw new ConflictException(
            `Role with key '${newKey}' already exists`,
          );
        }
      }

      // Update the role
      const updated = await this.model
        .findByIdAndUpdate(
          id,
          updateData as Parameters<typeof this.model.findByIdAndUpdate>[1],
          { new: true },
        )
        .exec();

      if (!updated) {
        throw new Error(`Role not found with ID: ${id}`);
      }

      return updated;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update role: ${errorMessage}`);
    }
  }

  /**
   * Find role by key
   * @param key - Role key
   * @returns Promise<RoleDocument | null> - Role if found
   */
  async findByKey(key: string): Promise<RoleDocument | null> {
    try {
      return await this.model.findOne({ key }).exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find role by key: ${errorMessage}`);
    }
  }

  /**
   * Find role by numeric ID
   * @param id - Role numeric ID
   * @returns Promise<RoleDocument | null> - Role if found
   */
  async findByNumericId(id: number): Promise<RoleDocument | null> {
    try {
      return await this.model.findOne({ role_id: id }).exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find role by numeric ID: ${errorMessage}`);
    }
  }

  /**
   * Find roles by role type
   * @param roleType - Role type number
   * @returns Promise<RoleDocument[]> - Array of roles
   */
  async findByRoleType(roleType: number): Promise<RoleDocument[]> {
    try {
      return await this.model.find({ role_type: roleType }).exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find roles by type: ${errorMessage}`);
    }
  }

  // delete role
  async delete(id: string): Promise<RoleDocument> {
    try {
      // if role = admin, throw error
      const role = await this.model.findById(id).exec();
      if (!role) {
        throw new Error(`Role not found with ID: ${id}`);
      }
      if (role.key === RoleType.ADMIN) {
        throw new Error('Cannot delete admin role');
      }
      const deleted = await this.model.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new Error(`Role not found with ID: ${id}`);
      }
      return deleted;
    } catch (error) {
      const errorMessage = error.message;
      throw new Error(errorMessage);
    }
  }
}
