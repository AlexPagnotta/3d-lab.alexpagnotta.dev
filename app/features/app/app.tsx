import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";

const Carousel = lazy(() =>
  import("~/pages/experiments/carousel/carousel").then((module) => ({ default: module.Carousel }))
);
const Ballpit = lazy(() => import("~/pages/experiments/ballpit").then((module) => ({ default: module.Ballpit })));
const NotFound = lazy(() => import("~/pages/not-found").then((module) => ({ default: module.NotFound })));

export const App = () => {
  return (
    <Switch>
      <Route path="/ballpit">
        <Suspense>
          <Ballpit />
        </Suspense>
      </Route>
      <Route path="/carousel">
        <Suspense>
          <Carousel />
        </Suspense>
      </Route>
      <Route>
        <Suspense>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
};
