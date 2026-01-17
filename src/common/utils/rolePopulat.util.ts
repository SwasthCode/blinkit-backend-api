
import { Model } from 'mongoose';

export const populateUserRoles = async (
    userRoleModel: Model<any>,
    allUsers: any[],
) => {
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
            userRoleModel
                .find({ role_type: { $in: Array.from(numericRoles) } })
                .lean()
                .exec(),
        );
    }
    if (stringRoles.size > 0) {
        tokenPromises.push(
            userRoleModel
                .find({ key: { $in: Array.from(stringRoles) } })
                .lean()
                .exec(),
        );
    }
    if (objectIdRoles.size > 0) {
        tokenPromises.push(
            userRoleModel
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
};