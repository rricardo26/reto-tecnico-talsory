import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EndorsementTemplateModel } from './EndorsementTemplateModel';

@Entity('template_applied_events')
@Unique(['template', 'orderEvent'])
export class TemplateAppliedEventModel {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  @ManyToOne(() => EndorsementTemplateModel, (t) => t.appliedEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template!: EndorsementTemplateModel;

  @Column({ name: 'description', type: 'varchar' })
  description!: string;

  @Column({ name: 'order_event', type: 'int' })
  orderEvent!: number;
}
