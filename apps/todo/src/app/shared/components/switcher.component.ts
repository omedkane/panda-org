import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core'
import { fromEvent, take } from 'rxjs'

@Component({
  selector: 'app-switcher',
  styles: `
  .switcher-container {
    opacity: 1;
    will-change: opacity;
    transition: opacity 0.5s;
    &.veiled {
      opacity: 0;
    }
  }
  `,
  template: `
    <div #container class="switcher-container">
      @if (io){
      <div id="el1-container">
        <ng-content select="[switch-el='1']"></ng-content>
      </div>
      } @else{
      <div id="el2-container">
        <ng-content select="[switch-el='2']"></ng-content>
      </div>
      }
    </div>
  `,
})
export class SwitcherComponent implements OnChanges {
  @Input({ required: true })
  remoteIO!: boolean

  @ViewChild('container')
  container!: ElementRef<HTMLDivElement>

  io = this.remoteIO

  ngOnChanges(changes: SimpleChanges): void {
    const cRemoteIO = changes['remoteIO']
    const className = 'veiled'
    if (cRemoteIO.previousValue !== cRemoteIO.currentValue) {
      if (cRemoteIO.previousValue !== undefined) {
        this.container.nativeElement.classList.add(className)
        fromEvent(this.container.nativeElement, 'transitionend')
          .pipe(take(1))
          .subscribe(() => {
            this.io = this.remoteIO
            this.container.nativeElement.classList.remove(className)
          })
      } else {
        this.io = this.remoteIO
        console.log('this.io:', this.io)
      }
    }
  }
}
