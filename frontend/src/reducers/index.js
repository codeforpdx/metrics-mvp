import Moment from 'moment';
import { WEEKDAYS, WEEKENDS } from '../UIConstants';
import {
  isIgnoredRoute,
  addRanks,
  addAveragesForAllDirections,
  computeScores,
} from '../helpers/routeCalculations';

export { default as loading } from './loadingReducer';
export { default as page } from './page';

const momentYesterday = Moment(Date.now() - 24 * 60 * 60 * 1000);

export const initialGraphParams = {
  agencyId: null,
  routeId: null,
  directionId: null,
  startStopId: null,
  endStopId: null,
  startTime: null,
  endTime: null,
  date: momentYesterday.format('YYYY-MM-DD'), // used where date ranges are not supported
  startDate: momentYesterday.format('YYYY-MM-DD'),
  // days of the week is an Object, where the keys are the day's values (0-6), and the value is true for enabled
  daysOfTheWeek: {
    ...WEEKDAYS.reduce((map, obj) => {
      map[obj.value] = true;
      return map;
    }, {}),
    ...WEEKENDS.reduce((map, obj) => {
      map[obj.value] = true;
      return map;
    }, {}),
  },
};

export function graphParams(state = initialGraphParams, action) {
  switch (action.type) {
    case 'RECEIVED_GRAPH_PARAMS':
      return { ...state, ...action.params };
    default:
      return state;
  }
}

const initialRoutes = {
  agencyId: null,
  data: null, // array of route config objects for Agencies[0]
};

export function routes(state = initialRoutes, action) {
  switch (action.type) {
    case 'REQUEST_ROUTES':
      return { ...state, agencyId: action.agencyId };
    case 'RECEIVED_ROUTES':
      return { ...state, data: action.data, agencyId: action.agencyId };
    case 'ERROR_ROUTES':
      return state;
    default:
      return state;
  }
}

const initialTripMetrics = {
  data: null, // TripMetrics object returned by GraphQL API, containing 'interval' and 'timeRanges' properties
  error: null,
};

export function tripMetrics(state = initialTripMetrics, action) {
  switch (action.type) {
    case 'REQUEST_TRIP_METRICS':
      return {
        ...state,
        error: null,
        data: null,
      };
    case 'RECEIVED_TRIP_METRICS':
      return {
        ...state,
        error: null,
        data: action.data,
      };
    case 'ERROR_TRIP_METRICS':
      return {
        ...state,
        error: action.error,
        data: null,
      };
    default:
      break;
  }
  return state;
}

const initialArrivals = {
  data: null,
  url: null,
  error: null,
};

export function arrivals(state = initialArrivals, action) {
  switch (action.type) {
    case 'RECEIVED_ARRIVALS':
      return {
        ...state,
        data: action.data,
        url: action.url,
        error: null,
      };
    case 'ERROR_ARRIVALS':
      return {
        ...state,
        data: null,
        error: action.error,
      };
    default:
      return state;
  }
}

const initialSpiderSelection = {
  stops: [],
  latLng: null,
};

export function spiderSelection(state = initialSpiderSelection, action) {
  switch (action.type) {
    case 'RECEIVED_SPIDER_MAP_CLICK':
      return {
        ...state,
        stops: action.stops,
        latLng: action.latLng,
      };
    default:
      return state;
  }
}

function addScores(stats) {
  Object.assign(
    stats,
    computeScores(
      stats.medianWaitTime,
      stats.onTimeRate,
      stats.averageSpeed,
      stats.travelTimeVariability,
    ),
  );
}

function makeStatsByRouteId(agencyMetricsData) {
  const routesStats = agencyMetricsData
    ? agencyMetricsData.interval.routes
    : [];

  const averagedProperties = [
    'medianWaitTime',
    'averageSpeed',
    'onTimeRate',
    'medianHeadway',
  ];
  routesStats.forEach(function(routeStats) {
    averagedProperties.forEach(function(property) {
      addAveragesForAllDirections(routeStats, property);
    });
  });

  /*
  const rankedRouteStats = routesStats.filter(
    stats =>
      !isIgnoredRoute({
        agencyId: agencyMetricsData.agencyId,
        id: stats.routeId,
      }),
  );

  addRanks(rankedRouteStats, 'medianWaitTime', 1, 'waitRank', 'waitRankCount');
  addRanks(rankedRouteStats, 'averageSpeed', -1, 'speedRank', 'speedRankCount');
  addRanks(rankedRouteStats, 'onTimeRate', -1, 'onTimeRank', 'onTimeRankCount');
  addRanks(
    rankedRouteStats,
    'travelTimeVariability',
    1,
    'variabilityRank',
    'variabilityRankCount',
  );

  routesStats.forEach(function(stats) {
    addScores(stats);
    stats.directions.forEach(function(dirStats) {
      addScores(dirStats);
    });
  });

  addRanks(rankedRouteStats, 'totalScore', -1, 'scoreRank', 'scoreRankCount');
  */

  const statsByRouteId = {};
  routesStats.forEach(routeStats => {
    statsByRouteId[routeStats.routeId] = routeStats;
  });

  return statsByRouteId;
}

const initialAgencyMetrics = {
  variablesJson: null,
  data: null,
  statsByRouteId: {},
};

export function agencyMetrics(state = initialAgencyMetrics, action) {
  switch (action.type) {
    case 'RECEIVED_AGENCY_METRICS':
      return {
        ...state,
        variablesJson: action.variablesJson,
        data: action.data,
        statsByRouteId: makeStatsByRouteId(action.data),
      };
    case 'REQUEST_AGENCY_METRICS':
      return {
        ...state,
        variablesJson: action.variablesJson,
        data: null,
        statsByRouteId: {},
      };
    default:
      return state;
  }
}

function makeSegmentsMap(routeMetricsData) {
  const segmentsMap = {};

  routeMetricsData.interval.directions.forEach(function(dirMetrics) {
    const dirSegmentsMap = {};
    dirMetrics.segments.forEach(function(segment) {
      dirSegmentsMap[segment.fromStopId] = segment;
    });

    segmentsMap[dirMetrics.directionId] = dirSegmentsMap;
  });
  return segmentsMap;
}

const initialRouteMetrics = {
  variablesJson: null,
  data: null,
  segmentsMap: {},
};

export function routeMetrics(state = initialRouteMetrics, action) {
  switch (action.type) {
    case 'RECEIVED_ROUTE_METRICS':
      addAveragesForAllDirections(
        action.data.interval,
        'scheduledMedianWaitTime',
      );
      addAveragesForAllDirections(
        action.data.interval,
        'scheduledMedianHeadway',
      );
      addAveragesForAllDirections(
        action.data.interval,
        'scheduledAverageSpeed',
      );

      return {
        ...state,
        variablesJson: action.variablesJson,
        data: action.data,
        segmentsMap: makeSegmentsMap(action.data),
      };
    case 'REQUEST_ROUTE_METRICS':
      return {
        ...state,
        variablesJson: action.variablesJson,
        data: null,
        segmentsMap: {},
      };
    default:
      return state;
  }
}
