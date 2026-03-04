import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { SessionsModule } from './sessions/sessions.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ReportsModule,
    SessionsModule,
    WorkLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
