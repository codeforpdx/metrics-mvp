import { NOT_FOUND } from 'redux-first-router';

export const components = {
  ABOUT: 'About',
  ISOCHRONE: 'Isochrone',
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  ROUTESCREEN: 'RouteScreen',
  DATADIAGNOSTIC: 'DataDiagnostic',
  [NOT_FOUND]: 'NotFound',
};

export default (state = 'DASHBOARD', action = {}) =>
  components[action.type] || state;
