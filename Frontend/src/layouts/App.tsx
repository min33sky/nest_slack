import Login from '@pages/Login';
import Signup from '@pages/Signup';
import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

export default function App() {
  return (
    <Switch>
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
    </Switch>
  );
}
