import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditLogDal } from './dal/mongodb/audit-log.dal';
import { ActionTypeDal } from './dal/mongodb/action-type.dal';
import { CategoryDal } from './dal/mongodb/category.dal';
import { SubCategoryDal } from './dal/mongodb/sub-category.dal';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './models/mongodb/audit-log';
import { AuditCategorySchema, Category } from './models/mongodb/category';
import { AuditSubCategorySchema, SubCategory } from './models/mongodb/sub-category';
import { ActionType, AuditActionTypeSchema } from './models/mongodb/action-type';
import { configService } from '../config/config.service';
import {
	AUDIT_ACTION_TYPES_COLLECTION,
	AUDIT_CATEGORIES_COLLECTION,
	AUDIT_LOGS_COLLECTION,
	AUDIT_SUB_CATEGORIES_COLLECTION,
} from './models/mongodb/constants';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { AuditProfile } from './profile/audit.profile';

@Module({
	imports: [
		MongooseModule.forRoot(configService.getMongoUrl()),
		MongooseModule.forFeature([{ name: AUDIT_LOGS_COLLECTION, schema: AuditLogSchema }]),
		MongooseModule.forFeature([{ name: AUDIT_CATEGORIES_COLLECTION, schema: AuditCategorySchema }]),
		MongooseModule.forFeature([{ name: AUDIT_SUB_CATEGORIES_COLLECTION, schema: AuditSubCategorySchema }]),
		MongooseModule.forFeature([{ name: AUDIT_ACTION_TYPES_COLLECTION, schema: AuditActionTypeSchema }]),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
	],
	providers: [AuditService, AuditLogDal, ActionTypeDal, CategoryDal, SubCategoryDal, AuditProfile],
	exports: [AuditService],
})
export class AuditModule {}
