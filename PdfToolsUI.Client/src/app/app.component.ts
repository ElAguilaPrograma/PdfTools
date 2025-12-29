import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProgressSpinner } from "primeng/progressspinner";
import { Loading } from "./shared/components/loading/loading";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Loading],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {

}
