import { Route } from '@angular/router'
import { LoginComponent } from './auth/pages/login/login.component'

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
]
