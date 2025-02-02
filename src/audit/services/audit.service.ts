import { BadRequestException, Injectable } from '@nestjs/common';
import { promiseAllSettled, useConditionalPromise } from '@bondsports/general';
import { i18n } from '../../i18n';
import { PaginationQuery, PaginationResultDto } from '@bondsports/types';
import { AuditLogDal } from '../dal/mongodb/audit-log.dal';
import { CategoryDal } from '../dal/mongodb/category.dal';
import { SubCategoryDal } from '../dal/mongodb/sub-category.dal';
import { ActionTypeDal } from '../dal/mongodb/action-type.dal';
import { AuditLogDto, CreateAuditLogDto } from '../types/dto/audit.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { AuditLog } from '../models/mongodb/audit-log';

@Injectable()
export class AuditService {
	constructor(
		private auditLogDal: AuditLogDal,
		private categoryDal: CategoryDal,
		private subCategoryDal: SubCategoryDal,
		private actionTypeDal: ActionTypeDal,
		@InjectMapper() private mapper: Mapper
	) {}

	/**
	 * Returns a paginated result for a given organization
	 * @param organizationId {number} - The organization ID
	 * @param pagination {DynamoPaginationQueryDto} - The pagination query
	 * @returns {Promise<PaginationResultDto<AuditLog>>} - The paginated result
	 */
	async getOrganizationAuditLogs(
		organizationId: number,
		pagination: PaginationQuery
	): Promise<PaginationResultDto<AuditLogDto>> {
		const { meta, data } = await this.auditLogDal.paginatedFind(organizationId, pagination);

		return {
			meta,
			data: this.mapper.mapArray(data, AuditLog, AuditLogDto),
		};
	}

	/**
	 * Creates an audit log
	 * @param organizationId {number} - The organization ID
	 * @param auditLogDto {CreateAuditLogDto} - The audit log to create
	 * @returns {Promise<AuditLogDto>} - The created audit log
	 */
	async createAuditLog(organizationId: number, auditLogDto: CreateAuditLogDto): Promise<AuditLogDto> {
		const [category, subCategory, actionType] = await promiseAllSettled(
			useConditionalPromise(
				() => this.categoryDal.findById(organizationId, auditLogDto.categoryId),
				!!auditLogDto.categoryId
			),
			useConditionalPromise(
				() => this.subCategoryDal.findById(organizationId, auditLogDto.subCategoryId),
				!!auditLogDto.subCategoryId
			),
			useConditionalPromise(
				() => this.actionTypeDal.findById(organizationId, auditLogDto.actionTypeId),
				!!auditLogDto.actionTypeId
			)
		);

		if (!category && auditLogDto.categoryId) {
			throw new BadRequestException(i18n.audit.errors.categoryNotFound(auditLogDto.categoryId));
		}

		if (!subCategory && auditLogDto.subCategoryId) {
			throw new BadRequestException(i18n.audit.errors.subCategoryNotFound(auditLogDto.subCategoryId));
		}

		if (!actionType && auditLogDto.actionTypeId) {
			throw new BadRequestException(i18n.audit.errors.actionTypeNotFound(auditLogDto.actionTypeId));
		}

		const document: AuditLog = await this.auditLogDal.create(
			organizationId,
			this.mapper.map(auditLogDto, AuditLogDto, AuditLog)
		);

		return this.mapper.map(document, AuditLog, AuditLogDto);
	}
}
