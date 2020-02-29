import React, { useState } from 'react';
import { FormControl, FormControlLabel, Radio } from '@material-ui/core';
import {
  XYPlot,
  HorizontalGridLines,
  XAxis,
  YAxis,
  LineSeries,
  VerticalBarSeries,
  ChartLabel,
  Crosshair,
} from 'react-vis';
import DiscreteColorLegend from 'react-vis/dist/legends/discrete-color-legend';
import Moment from 'moment';
import {
  CHART_COLORS,
  PLANNING_PERCENTILE,
  REACT_VIS_CROSSHAIR_NO_LINE,
} from '../UIConstants';
import { getPercentileValue } from '../helpers/graphData';
import '../../node_modules/react-vis/dist/style.css';

/**
 * Bar chart of average and planning percentile wait and time across the day.
 */
function TripTimesByDayChart(props) {
  const AVERAGE_TIME = 'average_time';
  const PLANNING_TIME = 'planning_time';

  const [selectedOption, setSelectedOption] = useState(AVERAGE_TIME); // radio button starts on average time
  const [crosshairValues, setCrosshairValues] = useState([]); // tooltip starts out empty

  const { byDayData, graphParams } = props;

  /**
   * Event handler for radio buttons
   * @param {changeEvent} The change event on the radio buttons.
   * @private
   */
  const handleOptionChange = changeEvent => {
    setSelectedOption(changeEvent.target.value);
  };

  /**
   * Event handler for onMouseLeave.
   * @private
   */
  const onMouseLeave = () => {
    setCrosshairValues([]);
  };

  /**
   * Returns a mapping function for creating a react-vis XYPlot data series out of interval data.
   * Example of interval data is shown at end of this file.
   * Mapping function is for either wait time or trip time, and for either average or planning percentile time.
   *
   * It's possible that an interval will have null wait/travel times due to lack of data (no vehicles
   * running in that interval), in which case we replace with zero values (best effort).
   *
   * @param {intervalField} One of wait_times or travel_times.
   */
  const mapDays = (field, attribute) => {
    return day => {
      let y = 0;

      if (day[field] != null) {
        if (attribute === AVERAGE_TIME) {
          y = day[field].median;
        } else if (attribute === PLANNING_TIME) {
          y = getPercentileValue(day[field], 90);
        }
      }

      if (y === undefined) {
        y = 0;
      }

      return {
        x: Moment(day.dates[0]).format('dd MM/DD'),
        y,
      };
    };
  };

  const waitData =
    byDayData && byDayData.map(mapDays('waitTimes', selectedOption));

  const tripData =
    byDayData && byDayData.map(mapDays('tripTimes', selectedOption));

  const meanWait =
    waitData &&
    waitData.length > 0 &&
    waitData.reduce((accum, value) => accum + value.y, 0) / waitData.length;
  const meanTrip =
    tripData &&
    tripData.length > 0 &&
    tripData.reduce((accum, value) => accum + value.y, 0) / tripData.length;
  const meanWaitData = [
    { x: waitData[0].x, y: meanWait },
    { x: waitData[waitData.length - 1].x, y: meanWait },
  ];
  const meanTripData = [
    { x: tripData[0].x, y: meanWait + meanTrip },
    { x: tripData[tripData.length - 1].x, y: meanWait + meanTrip },
  ];

  const maxWait =
    waitData &&
    waitData.length > 0 &&
    waitData.reduce((max, value) => (max > value.y ? max : value.y), 0);
  const maxTrip =
    tripData &&
    tripData.length > 0 &&
    tripData.reduce((max, value) => (max > value.y ? max : value.y), 0);

  const legendItems = [
    { title: 'Travel time', color: CHART_COLORS[1], strokeWidth: 10 },
    { title: 'Wait time', color: CHART_COLORS[0], strokeWidth: 10 },
  ];

  // Non-default chart margins for rotated x-axis tick marks.
  // Default is {left: 40, right: 10, top: 10, bottom: 40}

  const chartMargins = { left: 40, right: 10, top: 10, bottom: 60 };

  // Show a prompt to choose a date range if a date range is not selected.

  if (graphParams.date === graphParams.startDate) {
    return (
      <div>
        <p />
        To see performance by day, select a start date and end date.
      </div>
    );
  }

  /**
   * Event handler for onNearestX.
   * @param {Object} value Selected value.
   * @param {index} index Index of the value in the data array.
   * @private
   */
  const onNearestX = (_value, { index }) => {
    setCrosshairValues([waitData[index], tripData[index]]);
  };

  return (
    <div>
      {byDayData ? (
        <div>
          <FormControl>
            <div className="controls">
              <FormControlLabel
                control={
                  <Radio
                    id="average_time"
                    type="radio"
                    value={AVERAGE_TIME}
                    checked={selectedOption === AVERAGE_TIME}
                    onChange={handleOptionChange}
                  />
                }
                label="Median"
              />

              <FormControlLabel
                control={
                  <Radio
                    id="planning_time"
                    type="radio"
                    value={PLANNING_TIME}
                    checked={selectedOption === PLANNING_TIME}
                    onChange={handleOptionChange}
                  />
                }
                label={`Planning (${PLANNING_PERCENTILE}th percentile)`}
              />
            </div>
          </FormControl>
          <XYPlot
            xType="ordinal"
            height={300}
            width={400}
            margin={chartMargins}
            stackBy="y"
            yDomain={[0, maxWait + maxTrip]}
            onMouseLeave={onMouseLeave}
          >
            <HorizontalGridLines />
            <XAxis tickLabelAngle={-90} />
            <YAxis hideLine />

            <VerticalBarSeries
              data={waitData}
              color={CHART_COLORS[0]}
              onNearestX={onNearestX}
              stack
            />
            <VerticalBarSeries data={tripData} color={CHART_COLORS[1]} stack />
            <LineSeries
              data={meanWaitData}
              color={CHART_COLORS[2]}
              strokeDasharray="5, 5"
            />
            <LineSeries
              data={meanTripData}
              color={CHART_COLORS[3]}
              strokeDasharray="5, 5"
            />

            <ChartLabel
              text="minutes"
              className="alt-y-label"
              includeMargin={false}
              xPercent={0.06}
              yPercent={0.06}
              style={{
                transform: 'rotate(-90)',
                textAnchor: 'end',
              }}
            />

            {crosshairValues.length > 0 && (
              <Crosshair
                values={crosshairValues}
                style={REACT_VIS_CROSSHAIR_NO_LINE}
              >
                <div className="rv-crosshair__inner__content">
                  <p>
                    Onboard time:{' '}
                    {crosshairValues[1] ? Math.round(crosshairValues[1].y) : ''}
                  </p>
                  <p>Wait time: {Math.round(crosshairValues[0].y)}</p>
                </div>
              </Crosshair>
            )}
          </XYPlot>
          <DiscreteColorLegend
            orientation="horizontal"
            width={300}
            items={legendItems}
          />
        </div>
      ) : (
        <code>No data.</code>
      )}
    </div>
  );
}

export default TripTimesByDayChart;
