import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProfessionalService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async createProfessional(professionalDto: CreateProfessionalDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );

    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const professional = await this.prisma.professional.create({
      data: {
        name: professionalDto.name,
        profession: professionalDto.profession,
        document: professionalDto.document,
        generalRegister: professionalDto.generalRegister,
        registrationAgency: professionalDto.registrationAgency,
        // address: professionalDto.address,
        phone: professionalDto.phone,
      },
    });

    const user = await this.userService.createUserWithRelation(
      userDto,
      undefined,
      professional.id,
    );
    return { professional, user };
  }
}
