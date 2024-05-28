import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";

const NotFound = lazy(() => import("~/pages/not-found").then((module) => ({ default: module.NotFound })));
const Ballpit = lazy(() => import("~/pages/scenes/ballpit").then((module) => ({ default: module.Ballpit })));

export const App = () => {
  return (
    <Switch>
      <Route path="/ballpit">
        <Suspense>
          <Ballpit />
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
