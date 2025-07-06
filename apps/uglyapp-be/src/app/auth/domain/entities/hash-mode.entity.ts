import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'hash_mode' })
export class HashMode {
  @PrimaryColumn({ generated: 'increment' })
  id: number

  @Column()
  algo: string

  @Column({ nullable: true })
  rounds: number

  @Column({ nullable: true })
  salt: string

  @Column()
  isDefault: boolean
}
