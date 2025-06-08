import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateLoveDecorationDto } from '../love-decoration/dto/update-love-decoration.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('authenticated')
  findUserAuthenticated(@CurrentUser() user) {
    return this.userService.findOne(user.sub);
  }

  @Patch('address')
  updateAddress(@Body() dto: UpdateUserDto) {
    return this.userService.update(dto);
  }

  @Patch('profile-image')
  updateProfileImage(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.userService.updateProfileImage(id, data.profileImage);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
