/**
 * New Hire Templates Module - Quick Integration Guide
 * 
 * This file shows how to register the NewHireTemplatesModule in your NestJS app.
 * Copy these imports into your existing app.module.ts
 */

// ============================================================================
// STEP 1: Update app.module.ts
// ============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Import the NewHireTemplatesModule
import { NewHireTemplatesModule } from './modules/new-hire-templates/new-hire-templates.module';

// ... your other imports ...

@Module({
  imports: [
    ConfigModule.forRoot(),
    
    // Your existing TypeORM configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'sx_hris',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Always false in production
      logging: process.env.NODE_ENV === 'development'
    }),

    // ADD THIS LINE: Register NewHireTemplatesModule
    NewHireTemplatesModule,

    // ... your other modules ...
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// ============================================================================
// STEP 2: Run Database Migration
// ============================================================================

/*
# Connect to your PostgreSQL database
psql -U postgres -d sx_hris

# Or on Windows with pgAdmin, open Query Tool and run:
\i 'D:\SX-HRIS-main\SX-HRIS-main (1)\SX-HRIS-main\backend\migrations\20260429000002-create-new-hire-templates-tables.sql'

# Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%hire%';

# Expected output:
# - new_hire_templates
# - new_hire_instances
# - instance_tasks
# - task_approvals
# - instance_documents
# - automation_logs
# - notification_logs
*/

// ============================================================================
// STEP 3: Test Backend APIs
// ============================================================================

/*
After starting your NestJS server:

1. Create a template:
   POST http://localhost:3000/api/new-hire-templates
   {
     "name": "Software Engineer Onboarding",
     "description": "Standard onboarding for software engineers",
     "templateType": "ONBOARDING",
     "configuration": { "isActive": true },
     "pages": [],
     "workflow": { "phases": [] },
     "roles": [],
     "dashboards": []
   }

2. Get all templates:
   GET http://localhost:3000/api/new-hire-templates

3. Create an instance:
   POST http://localhost:3000/api/onboarding/instances
   {
     "templateId": "<template-uuid>",
     "employeeId": "<employee-uuid>",
     "startDate": "2026-05-01T00:00:00Z"
   }

4. Get pipeline:
   GET http://localhost:3000/api/onboarding/analytics/pipeline
*/

// ============================================================================
// STEP 4: Use Frontend Services
// ============================================================================

/*
In your React components:

import { fieldCatalogService } from './services/fieldCatalogService';
import { uiBlockService } from './services/uiBlockService';
import { portletService } from './services/portletService';
import { templateDesignerService } from './services/templateDesignerService';

// Example: Get field catalog
const catalog = fieldCatalogService.getFieldCatalog();
console.log(`Total fields: ${catalog.totalFields}`);

// Example: Get block library
const blockLibrary = uiBlockService.getBlockLibrary();
console.log(`Total blocks: ${blockLibrary.totalBlocks}`);

// Example: Get portlets for role
const hrPortlets = portletService.getPortletsByRole('HR');
console.log(`HR portlets: ${hrPortlets.length}`);

// Example: Create template
const template = templateDesignerService.createTemplate('My Template');
const page = templateDesignerService.addPage(template.id, {
  name: 'Welcome',
  type: 'WELCOME'
});
templateDesignerService.addBlockToPage(template.id, page.id, 'WELCOME_MESSAGE');
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
1. Module not found errors:
   - Ensure all files are in the correct directories
   - Run: npm install @nestjs/typeorm typeorm pg class-validator class-transformer

2. Database connection errors:
   - Check .env file has correct DB credentials
   - Verify PostgreSQL is running
   - Test connection: psql -U postgres -d sx_hris

3. Migration fails:
   - Check if tables already exist: \dt in psql
   - Drop tables if needed (see migration file for DROP statements)
   - Re-run migration

4. TypeScript errors:
   - Ensure tsconfig.json has "esModuleInterop": true
   - Run: npm run build to check for compilation errors

5. Service not available in frontend:
   - Check import paths are correct
   - Services are singletons, use default export
   - Example: import fieldCatalogService from './services/fieldCatalogService';
*/

// ============================================================================
// OPTIONAL: Swagger API Documentation
// ============================================================================

/*
To enable Swagger docs:

1. Install dependencies:
   npm install @nestjs/swagger swagger-ui-express

2. Update main.ts:

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SX-HRIS API')
    .setDescription('New Hire Templates API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log('Swagger docs: http://localhost:3000/api-docs');
}

bootstrap();
*/

// ============================================================================
// NEXT STEPS
// ============================================================================

/*
1. ✅ Backend is ready
2. ✅ Frontend services are ready
3. ⏳ Build UI components:
   - Block Library Browser
   - Template Designer (drag-drop)
   - Dashboard Builder
   - Analytics Dashboard

4. ⏳ Implement integrations:
   - Email notifications (SendGrid)
   - SMS notifications (Twilio)
   - Slack/Teams webhooks
   - Document storage (S3/Azure)

5. ⏳ Add authentication:
   - Uncomment @UseGuards(JwtAuthGuard) in controllers
   - Implement JWT strategy
   - Add role-based access control

6. ⏳ Testing:
   - Unit tests for services
   - E2E tests for API endpoints
   - Integration tests for workflows
*/

export {};
