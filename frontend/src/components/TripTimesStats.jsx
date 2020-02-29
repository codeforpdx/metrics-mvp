import React from 'react';
import { connect } from 'react-redux';
import {
  XYPlot,
  HorizontalGridLines,
  XAxis,
  YAxis,
  ChartLabel,
  VerticalRectSeries,
  Crosshair,
} from 'react-vis';
import { Typography } from '@material-ui/core';
import { CHART_COLORS, REACT_VIS_CROSSHAIR_NO_LINE } from '../UIConstants';

import TripTimesByTimeChart from './TripTimesByTimeChart';
import TripTimesByDayChart from './TripTimesByDayChart';
import TravelTimeChart from './TravelTimeChart';

function TripTimesStats(props) {
  const { tripMetrics, graphParams } = props;

  const [crosshairValues, setCrosshairValues] = React.useState({});

  const waitTimes = tripMetrics ? tripMetrics.interval.waitTimes : null;
  const tripTimes = tripMetrics ? tripMetrics.interval.tripTimes : null;
  const byDayData = tripMetrics ? tripMetrics.byDay : null;

  const waitData =
    waitTimes && waitTimes.histogram
      ? waitTimes.histogram.map(bin => ({
          x0: bin.binStart,
          x: bin.binEnd,
          y: bin.count,
        }))
      : null;

  const tripData =
    tripTimes && tripTimes.histogram
      ? tripTimes.histogram.map(bin => ({
          x0: bin.binStart,
          x: bin.binEnd,
          y: bin.count,
        }))
      : null;

  /**
   * Event handler for onMouseLeave.
   * @private
   */
  function onMouseLeave() {
    setCrosshairValues({});
  }

  function onNearestXWaitTimes(value, { index }) {
    setCrosshairValues({ wait: [waitData[index]] });
  }

  function onNearestXTripTimes(value, { index }) {
    setCrosshairValues({ trip: [tripData[index]] });
  }

  return (
    <>
      {tripMetrics ? (
        <div>
          <Typography variant="h5">Trip Times by Time of Day</Typography>
          <TripTimesByTimeChart tripMetrics={tripMetrics} />
        </div>
      ) : null}
      {tripMetrics && graphParams.date !== graphParams.startDate ? (
        <div>
          <Typography variant="h5">Trip Times by Day</Typography>
          <TripTimesByDayChart
            byDayData={byDayData}
            graphParams={graphParams}
          />
        </div>
      ) : null}
      {waitTimes ? (
        <div>
          <Typography variant="h5">Distribution of Wait Times</Typography>
          <div>
            median wait time {Math.round(waitTimes.median)} minutes, max wait
            time {Math.round(waitTimes.max)} minutes
          </div>
          <XYPlot
            xDomain={[0, Math.max(60, Math.round(waitTimes.max) + 5)]}
            height={300}
            width={500}
            onMouseLeave={onMouseLeave}
          >
            <HorizontalGridLines />
            <XAxis />
            <YAxis hideLine tickFormat={v => `${v}%`} />

            <VerticalRectSeries
              data={waitData}
              onNearestX={onNearestXWaitTimes}
              stroke="white"
              fill={CHART_COLORS[0]}
              style={{ strokeWidth: 2 }}
            />

            <ChartLabel
              text="chance"
              className="alt-y-label"
              includeMargin={false}
              xPercent={0.06}
              yPercent={0.06}
              style={{
                transform: 'rotate(-90)',
                textAnchor: 'end',
              }}
            />

            <ChartLabel
              text="minutes"
              className="alt-x-label"
              includeMargin={false}
              xPercent={0.9}
              yPercent={0.94}
            />

            {crosshairValues.wait && (
              <Crosshair
                values={crosshairValues.wait}
                style={REACT_VIS_CROSSHAIR_NO_LINE}
              >
                <div className="rv-crosshair__inner__content">
                  Chance: {Math.round(crosshairValues.wait[0].y)}%
                </div>
              </Crosshair>
            )}
          </XYPlot>
          TODO - show scheduled distribution of wait times
          <br />
          <br />
        </div>
      ) : null}
      {tripTimes ? (
        <div>
          <Typography variant="h5">Distribution of Travel Times</Typography>
          <div>
            {tripTimes.count} trips, median {Math.round(tripTimes.median)}{' '}
            minutes, max {Math.round(tripTimes.max)} minutes
          </div>
          <XYPlot
            xDomain={[0, Math.max(60, Math.round(tripTimes.max) + 5)]}
            height={300}
            width={500}
            onMouseLeave={onMouseLeave}
          >
            <HorizontalGridLines />
            <XAxis />
            <YAxis hideLine />

            <VerticalRectSeries
              data={tripData}
              onNearestX={onNearestXTripTimes}
              stroke="white"
              fill={CHART_COLORS[1]}
              style={{ strokeWidth: 2 }}
            />

            <ChartLabel
              text="trips"
              className="alt-y-label"
              includeMargin={false}
              xPercent={0.06}
              yPercent={0.06}
              style={{
                transform: 'rotate(-90)',
                textAnchor: 'end',
              }}
            />

            <ChartLabel
              text="minutes"
              className="alt-x-label"
              includeMargin={false}
              xPercent={0.9}
              yPercent={0.94}
            />

            {crosshairValues.trip && (
              <Crosshair
                values={crosshairValues.trip}
                style={REACT_VIS_CROSSHAIR_NO_LINE}
              >
                <div className="rv-crosshair__inner__content">
                  Trips: {Math.round(crosshairValues.trip[0].y)}
                </div>
              </Crosshair>
            )}
          </XYPlot>
          TODO - show scheduled distribution of travel times
        </div>
      ) : null}
      <TravelTimeChart />
    </>
  );
}

const mapStateToProps = state => ({
  tripMetrics: state.tripMetrics.data,
  graphParams: state.graphParams,
});

export default connect(mapStateToProps)(TripTimesStats);
