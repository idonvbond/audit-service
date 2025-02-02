import { Schema, model } from 'dynamoose';
import * as uuid from 'uuid';
import { IAuditActionType, IAuditCategory, IAuditLog, IAuditSubCategory } from './types/audit.dynamodb.interfaces';
import { Type } from 'class-transformer';
import { Category } from './category';
import { SubCategory } from './sub-category';
import { ActionType } from './action-type';
import { ModelType } from 'dynamoose/dist/General';

const AuditLogSchema = new Schema(
	{
		id: { type: String, required: true, index: true, default: () => uuid.v4(), hashKey: true },
		organizationId: { type: Number, index: true },
		facilityId: { type: Number, required: false, index: true },
		userId: { type: Number, required: true },
		userRoles: { type: Array, schema: [String], required: false },
		method: { type: String, required: true },
		url: { type: String, required: true },
		changes: { type: Object, required: false },
		response: { type: Object, required: false },
		deletedAt: {
			type: {
				value: Number,
				settings: {
					storage: 'milliseconds',
				},
			},
			default: null,
			required: false,
		},
		categoryId: { type: String, required: false },
		subCategoryId: { type: String, required: false },
		actionTypeId: { type: String, required: false },
	},
	{
		timestamps: {
			createdAt: {
				createdAt: {
					type: {
						value: Number,
						settings: {
							storage: 'milliseconds',
						},
					},
				},
			},
			updatedAt: {
				updatedAt: {
					type: {
						value: Number,
						settings: {
							storage: 'milliseconds',
						},
					},
				},
			},
		},
	}
);

export const AuditLogModel: ModelType<IAuditLog> = model('audit_logs', AuditLogSchema);

export class AuditLog {
	@Type(() => Number)
	userId: number;

	@Type(() => Number)
	facilityId?: number;

	@Type(() => String)
	userRoles?: string[];

	@Type(() => String)
	method: string;

	@Type(() => String)
	url: string;

	@Type(() => Object)
	changes?: any;

	@Type(() => Object)
	response?: any;

	@Type(() => String)
	categoryId?: string;

	@Type(() => String)
	subCategoryId?: string;

	@Type(() => String)
	actionTypeId?: string;

	@Type(() => Category)
	category: IAuditCategory;

	@Type(() => SubCategory)
	subCategory: IAuditSubCategory;

	@Type(() => ActionType)
	actionType: IAuditActionType;

	@Type(() => String)
	id: string;

	@Type(() => Number)
	organizationId: number;

	@Type(() => Number)
	createdAt: number;

	@Type(() => Number)
	updatedAt: number;

	@Type(() => Number)
	deletedAt?: number;
}
