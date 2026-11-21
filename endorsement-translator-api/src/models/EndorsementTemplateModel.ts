import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { TemplateDynamicFieldModel } from './TemplateDynamicFieldModel';
import { TemplateAppliedEventModel } from './TemplateAppliedEventModel';

@Entity('endorsement_templates')
@Unique(['productCode', 'endorsementType'])
export class EndorsementTemplateModel {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  @Column({ name: 'product_code', type: 'varchar' })
  productCode!: string;

  @Column({ name: 'endorsement_type', type: 'varchar' })
  endorsementType!: string;

  @Column({ name: 'event_description', type: 'varchar' })
  eventDescription!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @OneToMany(() => TemplateDynamicFieldModel, (field) => field.template, {
    cascade: true,
  })
  dynamicFields!: TemplateDynamicFieldModel[];

  @OneToMany(() => TemplateAppliedEventModel, (event) => event.template, {
    cascade: true,
  })
  appliedEvents!: TemplateAppliedEventModel[];
}
