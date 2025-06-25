import { Component } from '@angular/core'
import { RevealerComponent } from "../../../shared/components/revealer.component";
import { SwitcherComponent } from "../../../shared/components/switcher.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [RevealerComponent, SwitcherComponent],
})
export class LoginComponent {
  registerMode = false
}
