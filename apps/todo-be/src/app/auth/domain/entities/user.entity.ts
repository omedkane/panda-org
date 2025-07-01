import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { HashMode } from './hash-mode.entity'

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: string

  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @OneToOne(() => HashMode)
  @JoinColumn()
  hashMode: HashMode
}
