/**
 * Migration: Create user_category_preference table
 *
 * Adds table for tracking user's category affinity scores.
 * These scores drive the personalized feed algorithm.
 */
import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from "typeorm"

export class CreateUserCategoryPreference1777472645000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_category_preference",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "user_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "category",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "affinity_score",
            type: "decimal",
            precision: 4,
            scale: 3,
            default: 0.5,
            isNullable: false,
          },
          {
            name: "engagement_count",
            type: "int",
            default: 0,
            isNullable: false,
          },
          {
            name: "last_engagement_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    )

    // Add unique constraint on (user_id, category)
    // One preference record per user per category
    await queryRunner.createUniqueConstraint(
      "user_category_preference",
      new TableUnique({
        name: "UQ_user_category",
        columnNames: ["user_id", "category"],
      }),
    )

    // Index on user_id for fast lookup
    await queryRunner.createIndex(
      "user_category_preference",
      new TableIndex({
        name: "IDX_user_category_preference_user_id",
        columnNames: ["user_id"],
      }),
    )

    // Index on affinity_score for analytics queries
    await queryRunner.createIndex(
      "user_category_preference",
      new TableIndex({
        name: "IDX_user_category_preference_affinity",
        columnNames: ["affinity_score"],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("user_category_preference")
  }
}
