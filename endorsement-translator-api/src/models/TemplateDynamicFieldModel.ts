import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EndorsementTemplateModel } from './EndorsementTemplateModel';

@Entity('template_dynamic_fields')
@Unique(['template', 'orderIndex'])
export class TemplateDynamicFieldModel {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  @ManyToOne(() => EndorsementTemplateModel, (t) => t.dynamicFields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template!: EndorsementTemplateModel;

  @Column({ name: 'etiqueta', type: 'varchar' })
  etiqueta!: string;

  @Column({ name: 'source_field', type: 'varchar', nullable: true })
  sourceField!: string | null;

  @Column({ name: 'default_value', type: 'varchar', nullable: true })
  defaultValue!: string | null;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex!: number;
}
