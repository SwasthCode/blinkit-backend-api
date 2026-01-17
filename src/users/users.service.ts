import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateUserDto } from './dto';
import { BaseService } from '../common/base/base.service';
import { PasswordUtil } from '../common/utils';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
    @InjectModel(Role.name) private userRoleModel: Model<RoleDocument>,
  ) {
    super(userModel);
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const encryptedPassword: string | undefined = undefined;

      // if (createUserDto.password) {
      //   // Validate password strength
      //   const passwordValidation = PasswordUtil.validatePasswordStrength(
      //     createUserDto.password,
      //   );
      //   if (!passwordValidation.isValid) {
      //     throw new Error(
      //       `Password does not meet security requirements: ${passwordValidation.suggestions.join(', ')}`,
      //     );
      //   }

      //   // Encrypt the password
      //   encryptedPassword = PasswordUtil.encryptPassword(
      //     createUserDto.password,
      //   );
      // }

      // Create user data with encrypted password if provided
      const userData: any = {
        ...createUserDto,
        // password: encryptedPassword,
        // role: createUserDto.role || 'user',
        // status: createUserDto.status || 'active',
      };

      if (!userData.email) {
        delete userData.email;
      }

      // Create and save the user
      const created = new this.model(userData);
      return await created.save();
    } catch (error) {
      if (error && error.code === 11000) {
        if (error.keyPattern.phone_number) {
          throw new Error('User with this phone number already exists');
        }
        if (error.keyPattern.email) {
          throw new Error('User with this email already exists');
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }

  async findAll(options: {
    filter?: any;
    select?: string;
    sort?: unknown;
    limit?: number | string;
    skip?: number | string;
  }): Promise<UserDocument[]> {
    const { filter, select, sort, limit, skip } = options;

    // 1. Fetch ALL users (initial database retrieval)
    // optimization: if filter doesn't contain role fields, we could apply it here,
    // but for simplicity and full support of mixed queries, we fetch all.
    const allUsers = await this.model.find({}).lean().exec();

    // 2. Populate Roles (Manual Population)
    const numericRoles = new Set<number>();
    const stringRoles = new Set<string>();
    const objectIdRoles = new Set<string>();

    allUsers.forEach((user: any) => {
      const roles = Array.isArray(user.role)
        ? user.role
        : user.role
          ? [user.role]
          : [];
      roles.forEach((r: any) => {
        if (typeof r === 'number') {
          numericRoles.add(r);
        } else if (typeof r === 'string') {
          const num = Number(r);
          if (!isNaN(num)) {
            numericRoles.add(num);
          } else if (r.match(/^[0-9a-fA-F]{24}$/)) {
            objectIdRoles.add(r);
          } else {
            stringRoles.add(r);
          }
        } else if (r && r.toString().match(/^[0-9a-fA-F]{24}$/)) {
          // Handle ObjectId objects if lean() returned them as such
          objectIdRoles.add(r.toString());
        }
      });
    });

    const roleMap = new Map<any, any>();
    const tokenPromises: Promise<any>[] = [];

    if (numericRoles.size > 0) {
      tokenPromises.push(
        this.userRoleModel
          .find({ role_type: { $in: Array.from(numericRoles) } })
          .lean()
          .exec(),
      );
    }
    if (stringRoles.size > 0) {
      tokenPromises.push(
        this.userRoleModel
          .find({ key: { $in: Array.from(stringRoles) } })
          .lean()
          .exec(),
      );
    }
    if (objectIdRoles.size > 0) {
      tokenPromises.push(
        this.userRoleModel
          .find({ _id: { $in: Array.from(objectIdRoles) } })
          .lean()
          .exec(),
      );
    }

    const fetchedRolesGroups = await Promise.all(tokenPromises);
    fetchedRolesGroups.flat().forEach((role: any) => {
      if (role.role_type) roleMap.set(role.role_type, role);
      if (role.key) roleMap.set(role.key, role);
      if (role._id) roleMap.set(role._id.toString(), role);
    });

    allUsers.forEach((user: any) => {
      const userRoles = Array.isArray(user.role)
        ? user.role
        : user.role
          ? [user.role]
          : [];
      user.role = userRoles.map((r: any) => {
        let found = roleMap.get(r);

        // Try looking up by numeric value if string
        if (!found && typeof r === 'string' && !isNaN(Number(r))) {
          found = roleMap.get(Number(r));
        }

        // Try looking up by string if object (ObjectId)
        if (!found && typeof r === 'object' && r.toString) {
          found = roleMap.get(r.toString());
        }

        // Try looking up by string if it looks like an ID but wasn't found directly (redundant if first get worked, but safe)
        if (!found && typeof r === 'string' && r.match(/^[0-9a-fA-F]{24}$/)) {
          found = roleMap.get(r);
        }

        return found || r;
      });
    });

    // 3. In-Memory Filtering
    let filteredUsers = allUsers;
    if (filter) {
      try {
        const parsedFilter =
          typeof filter === 'string' ? JSON.parse(filter) : filter;
        filteredUsers = allUsers.filter((user) => {
          return Object.keys(parsedFilter).every((key) => {
            const filterVal = parsedFilter[key];
            // Support nested keys like 'role.name'
            const userVal = key
              .split('.')
              .reduce(
                (obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined),
                user,
              );

            // Simple equality check (expand for more complex mongo operators if needed)
            // Handling array lookups for roles? Simplistic approach:
            if (Array.isArray(userVal) && !Array.isArray(filterVal)) {
              // if user has multiple roles and we filter by one value, check if it includes
              // This is tricky for object arrays.
              // For now, simple strict equality or includes
              return userVal.includes(filterVal);
            }
            if (
              Array.isArray(userVal) &&
              Array.isArray(filterVal) &&
              key.includes('role')
            ) {
              // If filtering on nested role array properties (e.g. role.name), userVal would actually be an array of names
              // This reduce logic above usually handles objects, for arrays it gets weird.
              // Let's settle for simple generic equality for now.
              return userVal == filterVal;
            }

            return userVal == filterVal;
          });
        });
      } catch (e) {
        console.warn('In-memory filter parse failed', e);
      }
    }

    // 4. In-Memory Sorting
    if (sort) {
      try {
        const sortObj = typeof sort === 'string' ? JSON.parse(sort) : sort;
        // sortObj: { field: 1 or -1 }
        const sortKeys = Object.keys(sortObj);
        if (sortKeys.length > 0) {
          const key = sortKeys[0]; // simplistic single field sort
          const dir = parseInt(sortObj[key]) || 1;

          filteredUsers.sort((a: any, b: any) => {
            const valA = key.split('.').reduce((o, k) => (o ? o[k] : null), a);
            const valB = key.split('.').reduce((o, k) => (o ? o[k] : null), b);

            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
          });
        }
      } catch {
        // ignore sort errors
      }
    }

    // 5. In-Memory Pagination
    const skipVal = typeof skip === 'string' ? parseInt(skip, 10) : skip || 0;
    const limitVal =
      typeof limit === 'string' ? parseInt(limit, 10) : limit || 0;

    let paginatedUsers = filteredUsers;
    if (skipVal > 0) {
      paginatedUsers = paginatedUsers.slice(skipVal);
    }
    if (limitVal > 0) {
      paginatedUsers = paginatedUsers.slice(0, limitVal);
    }

    // 6. In-Memory Selection
    if (select) {
      const fields = select.split(/[,\s]+/).filter((f) => f.trim());
      if (fields.length > 0) {
        return paginatedUsers.map((user: any) => {
          const selectedUser: any = {};
          // Always include _id unless explicitly excluded (not implementing exclusion logic for now)
          selectedUser._id = user._id;
          fields.forEach((field) => {
            // Supports simplistic top-level fields only for now
            if (user[field] !== undefined) {
              selectedUser[field] = user[field];
            }
          });
          return selectedUser;
        });
      }
    }

    return paginatedUsers as any;
  }

  async findByPhone(phone_number: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone_number }).exec();
  }

  // async verifyPassword(
  //   email: string,
  //   plainPassword: string,
  // ): Promise<UserDocument | null> {
  //   try {
  //     const user = await this.model.findOne({ email }).exec();
  //     if (!user || !user.password) {
  //       return null;
  //     }

  //     const decryptedPassword = PasswordUtil.decryptPassword(user.password);
  //     if (decryptedPassword === plainPassword) {
  //       return user;
  //     }

  //     return null;
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : 'Unknown error';
  //     throw new Error(`Password verification failed: ${errorMessage}`);
  //   }
  // }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<UserDocument> {
    try {
      // Validate password strength
      const passwordValidation =
        PasswordUtil.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(
          `Password does not meet security requirements: ${passwordValidation.suggestions.join(', ')}`,
        );
      }

      // Encrypt the new password
      const encryptedPassword = PasswordUtil.encryptPassword(newPassword);

      // Update the user's password
      const updated = await this.model
        .findByIdAndUpdate(
          userId,
          { password: encryptedPassword },
          { new: true },
        )
        .exec();

      if (!updated) {
        throw new Error(`User not found with ID: ${userId}`);
      }

      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update password: ${errorMessage}`);
    }
  }

  async getProfile(userId: string) {
    const user: any = await this.model.findById(userId).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // describe role
    // if user.role=[1,2,3]
    // then user.role=1
    if (user.role && user.role.length > 1) {
      // get each role info
      const newRole: any[] = [];
      const roles = await this.userRoleModel.find({
        role_type: { $in: user.role },
      });
      for (const role of roles) {
        newRole.push(role);
      }
      user.role = newRole;
    } else {
      const role = await this.userRoleModel.findOne({ role_type: user.role });
      user.role = [role];
    }

    return user;
  }
}
