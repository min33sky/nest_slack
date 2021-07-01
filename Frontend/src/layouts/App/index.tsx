import React from 'react';
import loadable from '@loadable/component';
import { Switch, Redirect, Route } from 'react-router-dom';

const Login = loadable(() => import('@pages/Login'));
const Signup = loadable(() => import('@pages/Signup'));
const Channel = loadable(() => import('@pages/Channel'));

export default function App() {
  return (
    <Switch>
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/workspace/channel" component={Channel} />
    </Switch>
  );
}
