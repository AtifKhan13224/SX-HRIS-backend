import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateObjectDefinitionConfigTable1740200000000 implements MigrationInterface {
  name = 'CreateObjectDefinitionConfigTable1740200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // OBJECT DEFINITION CONFIG TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'object_definition_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'objectType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'definition',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '50',
            default: "'1.0'",
            isNullable: false,
          },
          {
            name: 'modifiedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create unique index on objectType
    await queryRunner.createIndex(
      'object_definition_configs',
      new TableIndex({
        name: 'IDX_OBJECT_DEFINITION_OBJECT_TYPE',
        columnNames: ['objectType'],
        isUnique: true,
      }),
    );

    // Create index on version for potential future queries
    await queryRunner.createIndex(
      'object_definition_configs',
      new TableIndex({
        name: 'IDX_OBJECT_DEFINITION_VERSION',
        columnNames: ['version'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('object_definition_configs', 'IDX_OBJECT_DEFINITION_VERSION');
    await queryRunner.dropIndex('object_definition_configs', 'IDX_OBJECT_DEFINITION_OBJECT_TYPE');

    // Drop table
    await queryRunner.dropTable('object_definition_configs');
  }
}
