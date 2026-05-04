import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if super admin already exists
    const existingAdmin = await usersService.findByEmail('admin@sx-hris.com');
    
    if (existingAdmin) {
      console.log('Super admin already exists!');
      console.log('Email: admin@sx-hris.com');
      await app.close();
      return;
    }

    // Create super admin user
    const superAdmin = await usersService.create({
      email: 'admin@sx-hris.com',
      password: 'Admin@123',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email: admin@sx-hris.com');
    console.log('Password: Admin@123');
    console.log('Role:', superAdmin.role);
    console.log('\n⚠️  Please change this password after first login!');

  } catch (error) {
    console.error('Error creating super admin:', error.message);
  }

  await app.close();
}

bootstrap();
