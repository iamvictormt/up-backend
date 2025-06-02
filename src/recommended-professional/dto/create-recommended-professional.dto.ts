import { WeekDay } from '@prisma/client';

export class CreateRecommendedProfessionalDto {
  name: string;
  profession: string;
  description?: string;
  phone: string;
  email?: string;

  state: string;
  city: string;
  district: string;
  street?: string;
  number?: string;
  complement?: string;
  zipCode?: string;

  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };

  availableDays?: WeekDay[];
  isActive?: boolean;
}
