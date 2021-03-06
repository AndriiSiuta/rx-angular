import { ApplicationRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppRenderStrategy, ConfigService } from './config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tour of Heroes';

  constructor(
    private router: Router,
    private appRef: ApplicationRef,
    private configService: ConfigService
  ) {
    configService.setStrategy(AppRenderStrategy.ɵlocal);
    router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => appRef.tick());
  }
}
