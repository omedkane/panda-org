import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core'
import { fromEvent, Subject, take, takeUntil } from 'rxjs'

@Component({
  selector: 'app-revealer',
  styles: [
    `
      :host {
        width: 100%;
      }
      .revealer {
        height: 0;
        width: 100%;
        opacity: 0;
        overflow: hidden;
        position: relative;
        pointer-events: none;
        will-change: height, opacity;
        &.animated {
          transition: height 0.75s, opacity 0.75s;
        }
        &.revealed {
          opacity: 1;
          pointer-events: unset;
        }
      }
    `,
  ],
  template: `
    <div class="w-full">
      <div
        #revealer
        class="revealer w-full"
        [class.revealed]="revealed"
        [style.height]="(revealed ? contentHeight : 0) + 'px'">
        <div #contentWrapper class="flex flex-col revealer-content absolute w-full">
          @if(contentShouldRender){
          <ng-content />
          }
        </div>
      </div>
    </div>
  `,
})
export class RevealerComponent implements OnInit, OnDestroy, OnChanges {
  contentHeight = 0
  @Input({ required: true })
  revealed!: boolean

  contentShouldRender = true

  @ViewChild('contentWrapper')
  contentWrapper!: ElementRef<HTMLDivElement>

  @ViewChild('revealer')
  revealer!: ElementRef<HTMLDivElement>

  getClientHeight = () => this.contentWrapper.nativeElement.clientHeight

  resolveContentHeight = () =>
    new Promise<number>((resolve) => {
      requestAnimationFrame(() => resolve(this.getClientHeight()))
    })

  updateContentHeight = async () => (this.contentHeight = await this.resolveContentHeight())

  ngOnInit(): void {
    requestAnimationFrame(async () => {
      await this.updateContentHeight()
      console.log('this.contentHeight:', this.contentHeight)
      this.contentShouldRender = this.revealed
    })
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.$destroy))
      .subscribe(() => {
        console.log('resized')
        this.updateContentHeight()
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cRevealed = changes['revealed']

    if (!cRevealed?.firstChange) this.revealer?.nativeElement.classList.add('animated')

    if (cRevealed.currentValue != cRevealed.previousValue && cRevealed.previousValue !== undefined) {
      if (cRevealed.previousValue === true) {
        // * it is about to disappeaer
        fromEvent(this.revealer.nativeElement, 'transitionend')
          .pipe(take(1))
          .subscribe(() => {
            console.log('I disappeared')

            return (this.contentShouldRender = false)
          })
      } else if (cRevealed.previousValue === false) {
        // * it is going to appear
        this.contentShouldRender = true
      }
    }
  }

  $destroy = new Subject<void>()

  ngOnDestroy(): void {
    this.$destroy.next()
  }
}
