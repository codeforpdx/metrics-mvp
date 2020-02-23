/**
 * Card for displaying one metric.
 */

import React, { Fragment, useState } from 'react';

import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import Box from '@material-ui/core/Box';
import {
  scoreBackgroundColor,
  scoreContrastColor,
} from '../helpers/routeCalculations';

/**
 * Renders an "nyc bus stats" style summary of a route and direction.
 *
 * @param {any} props
 */
export default function InfoScoreCard(props) {
  const {
    score,
    title,
    largeValue,
    smallValue,
    bottomContent,
    popoverContent,
  } = props;

  const useStyles = makeStyles(theme => ({
    popover: {
      padding: theme.spacing(2),
      maxWidth: 500,
    },
  }));

  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const cardStyle = {
    background: score != null ? scoreBackgroundColor(score) : 'white',
    color: score != null ? scoreContrastColor(score) : 'black',
    margin: 4,
    minWidth: 150,
  };

  return (
    <Fragment>
      <Grid item xs component={Paper} style={cardStyle}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          height="100%"
        >
          <Typography variant="overline">{title}</Typography>

          <Box flexGrow={1}>
            {' '}
            {/* middle area takes all possible height */}
            <Typography variant="h3" display="inline">
              {largeValue}
            </Typography>
            <Typography variant="h5" display="inline">
              {smallValue}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            pt={2}
          >
            {bottomContent}
            <IconButton size="small" onClick={handleClick}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Grid>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div className={classes.popover}>{popoverContent}</div>
      </Popover>
    </Fragment>
  );
}
