import * as fs from 'fs';
import * as path from 'path';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import * as dynamoose from 'dynamoose';
import { Logger } from './logger';

require('dotenv').config();

export enum ConfigKeysEnum {
	PORT = 'PORT',
	DYNAMO_DB_HOST = 'DYNAMO_DB_HOST',
	DYNAMO_DB_PORT = 'DYNAMO_DB_PORT',
	DYNAMO_DB_USERNAME = 'DYNAMO_DB_USERNAME',
	DYNAMO_DB_PASSWORD = 'DYNAMO_DB_PASSWORD',
	DYNAMO_DB_NAME = 'DYNAMO_DB_NAME',
	DYNAMO_DB_REGION = 'DYNAMO_DB_REGION',
	PUB_SUB_CHANNEL = 'PUB_SUB_CHANNEL',
	REDIS_WRITER_URL = 'REDIS_WRITER_URL',
	NODE_ENV = 'NODE_ENV',
	MONGODB_DATABASE_URL = 'MONGO_DATABASE_URL',
	MONGODB_DATABASE_PORT = 'MONGO_DATABASE_PORT',
	MONGODB_DATABASE_USER = 'MONGO_DATABASE_USER',
	MONGODB_DATABASE_PASSWORD = 'MONGO_DATABASE_PASSWORD',
}

type Env = { [key in ConfigKeysEnum]: string } & Record<string, string>;

const { version, name } = JSON.parse(fs.readFileSync(path.resolve(__filename, '../../../', 'package.json')).toString());

class ConfigService {
	constructor(private env: Env) {}

	public getValue(key: string, trowOnMissing = true): string {
		const value: string = this.env[key];

		if (!value && trowOnMissing) {
			throw new Error(`config error - missing env.${key}`);
		}

		return value;
	}

	public ensureValues(keys: string[]): boolean {
		return keys.every(key => this.getValue(key, true));
	}

	public getPort(): number {
		return Number(this.getValue(ConfigKeysEnum.PORT));
	}

	public getVersion(): string {
		return version;
	}

	public async setupDynamodb(): Promise<void> {
		const host: string = this.getValue(ConfigKeysEnum.DYNAMO_DB_HOST);
		const port: string = this.getValue(ConfigKeysEnum.DYNAMO_DB_PORT);

		const database: DynamoDB = new dynamoose.aws.ddb.DynamoDB({
			endpoint: `${host}:${port}`,
			region: !this.isLocalEnvironment() ? this.getValue(ConfigKeysEnum.DYNAMO_DB_REGION) : undefined,
		});

		dynamoose.aws.ddb.set(database);

		Logger.info(`Successfully connected to DynamoDB "${host}" on port "${port}"`);
	}

	public isLocalEnvironment(): boolean {
		const nodeEnv: string = this.getValue(ConfigKeysEnum.NODE_ENV, false);
		return !nodeEnv || nodeEnv === 'development';
	}

	public getMongoUrl(): string {
		const url: string = this.getValue(ConfigKeysEnum.MONGODB_DATABASE_URL);
		const port: string = this.getValue(ConfigKeysEnum.MONGODB_DATABASE_PORT);

		const password: string = this.getValue(ConfigKeysEnum.MONGODB_DATABASE_PASSWORD, false);
		const user: string = this.getValue(ConfigKeysEnum.MONGODB_DATABASE_USER, false);

		if (!password && !user) {
			return `${url}:${port}`;
		}

		if (!user || !password) {
			throw new Error('MongoDB user and password must be provided');
		}

		const [protocol, host] = url.split('://');

		return `${protocol}://${user}:${password}@${host}:${port}`;
	}
}

export const configService: ConfigService = new ConfigService(process.env as Env);
configService.ensureValues([
	ConfigKeysEnum.PORT,
	ConfigKeysEnum.DYNAMO_DB_HOST,
	ConfigKeysEnum.DYNAMO_DB_PORT,
	ConfigKeysEnum.PUB_SUB_CHANNEL,
	ConfigKeysEnum.REDIS_WRITER_URL,
	ConfigKeysEnum.MONGODB_DATABASE_URL,
	ConfigKeysEnum.MONGODB_DATABASE_PORT,
]);
