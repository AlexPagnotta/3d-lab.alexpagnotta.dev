import { Route, Switch } from "wouter";

import { Ballpit } from "~/pages/experiments/ballpit";
import { NotFound } from "~/pages/not-found";

export const App = () => {
  return (
    <Switch>
      <Route path="/ballpit" component={Ballpit} />
      <Route component={NotFound} />
    </Switch>
  );
};
