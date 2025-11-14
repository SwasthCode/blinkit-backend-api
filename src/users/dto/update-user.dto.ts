import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Inherits all fields from CreateUserDto as optional
  // Can add user-specific update fields here if needed
}
