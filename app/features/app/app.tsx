import { Route, Switch } from "wouter";

import { NotFound } from "~/pages/not-found";
import { Ballpit } from "~/pages/scenes/ballpit";

export const App = () => {
  return (
    <Switch>
      <Route path="/ballpit" component={Ballpit} />
      <Route path="/ballpit-2" component={Ballpit} />
      <Route component={NotFound} />
    </Switch>
  );
};
