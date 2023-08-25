import { AnimatedFlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { DEFAULT_PROPS } from '../../../constants';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type { DayBarItemProps, HighlightDates } from '../../../types';
import MultipleDayBar from './MultipleDayBar';
import ProgressBar from './ProgressBar';
import SingleDayBar from './SingleDayBar';
import {styled} from "meeting/src/global";
import {COLUMNS} from "@howljs/calendar-kit/src/constants";
import moment from "moment-timezone";
import {useTheme} from "styled-components/native"

interface TimelineHeaderProps {
  renderDayBarItem?: (props: DayBarItemProps) => JSX.Element;
  onPressDayNum?: (date: string) => void;
  isLoading?: boolean;
  highlightDates?: HighlightDates;
  selectedEventId?: string;
  onPickDay?: () => void;
}

const TimelineHeader = ({
  renderDayBarItem,
  onPressDayNum,
  isLoading,
  highlightDates,
  selectedEventId,
  onPickDay
}: TimelineHeaderProps) => {
  const {
    syncedLists,
    viewMode,
    dayBarListRef,
    pages,
    timelineWidth,
    rightSideWidth,
    currentIndex,
    hourWidth,
    columnWidth,
    theme,
    locale,
    tzOffset,
    currentDate,
      firstDate
  } = useTimelineCalendarContext();
  const [startDate, setStartDate] = useState(pages[viewMode].data[pages[viewMode].index] || '');
  const weekBarIndex = useRef(pages.week.index);
  const dayBarIndex = useRef(pages.day.index);
  const _theme = useTheme();

  const getDate = useCallback(() => {
    const numOfDays = viewMode === 'workWeek' ? COLUMNS.week : COLUMNS[viewMode];
    const firstDateMoment = moment.tz(firstDate.current[viewMode], tzOffset);
    const currentDay = firstDateMoment.add(weekBarIndex.current * numOfDays, 'd');
    return currentDay.format('YYYY-MMM').split('-');
  }, [viewMode, firstDate, tzOffset, weekBarIndex]);

  const renderTextMonth = () => {
    return (
        <TouchableOpacity
            disabled={!onPickDay}
            onPress={() => onPickDay && onPickDay()}
            activeOpacity={0.8}
            style={{width: hourWidth, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.dayName}>{getDate()[1]}</Text>
          <Text style={styles.dayNumber}>{getDate()[0]}</Text>
        </TouchableOpacity>
    )
  };

  const _renderSingleDayItem = ({
    item,
    extraData,
  }: ListRenderItemInfo<string>) => {
    const dayItemProps = {
      width: timelineWidth,
      startDate: item,
      columnWidth,
      hourWidth,
      viewMode,
      onPressDayNum,
      theme: extraData.theme,
      locale: extraData.locale,
      highlightDates: extraData.highlightDates,
      tzOffset,
      currentDate: extraData.currentDate,
    };

    if (renderDayBarItem) {
      return renderDayBarItem(dayItemProps);
    }

    return <SingleDayBar {...dayItemProps} />;
  };

  const _renderMultipleDayItem = ({
    item,
    extraData,
  }: ListRenderItemInfo<string>) => {
    const dayItemProps = {
      width: rightSideWidth,
      startDate: item,
      columnWidth,
      hourWidth,
      viewMode,
      onPressDayNum,
      theme: extraData.theme,
      locale: extraData.locale,
      highlightDates: extraData.highlightDates,
      tzOffset,
      currentDate: extraData.currentDate,
    };

    if (renderDayBarItem) {
      return renderDayBarItem(dayItemProps);
    }

    return <MultipleDayBar {...dayItemProps} />;
  };

  const extraValues = useMemo(
    () => ({ locale, highlightDates, theme, currentDate, columnWidth }),
    [locale, highlightDates, theme, currentDate, columnWidth]
  );

  const _renderDayBarList = () => {
    const listProps = {
      ref: dayBarListRef,
      keyExtractor: (item: string) => item,
      scrollEnabled: false,
      disableHorizontalListHeightMeasurement: true,
      showsHorizontalScrollIndicator: false,
      horizontal: true,
      bounces: false,
      scrollEventThrottle: 16,
      pagingEnabled: true,
      extraData: extraValues,
    };

    if (viewMode === 'day') {
      return (
        <View style={{ width: timelineWidth }}>
          <AnimatedFlashList
            {...listProps}
            data={pages[viewMode].data}
            initialScrollIndex={pages[viewMode].index}
            estimatedItemSize={timelineWidth}
            estimatedListSize={{
              width: timelineWidth,
              height: DEFAULT_PROPS.DAY_BAR_HEIGHT,
            }}
            renderItem={_renderSingleDayItem}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const width = e.nativeEvent.layoutMeasurement.width;
              const pageIndex = Math.round(x / width);
              if (dayBarIndex.current !== pageIndex) {
                dayBarIndex.current = pageIndex;
              }
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.multipleDayContainer}>
        {renderTextMonth()}
        <View style={{ width: rightSideWidth }}>
          <AnimatedFlashList
            {...listProps}
            data={pages[viewMode].data}
            initialScrollIndex={pages[viewMode].index}
            estimatedItemSize={rightSideWidth}
            estimatedListSize={{
              width: rightSideWidth,
              height: DEFAULT_PROPS.DAY_BAR_HEIGHT,
            }}
            renderItem={_renderMultipleDayItem}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const width = e.nativeEvent.layoutMeasurement.width;
              const pageIndex = Math.round(x / width);
              if (weekBarIndex.current !== pageIndex) {
                weekBarIndex.current = pageIndex;
              }
            }}
          />
        </View>
      </View>
    );
  };

  useAnimatedReaction(
    () => currentIndex.value,
    (index) => {
      if (syncedLists) {
        return;
      }

      const dateByIndex = pages[viewMode].data[index];

      if (dateByIndex) {
        runOnJS(setStartDate)(dateByIndex);
      }
    },
    [viewMode, syncedLists]
  );

  const _renderDayBarView = () => {
    if (viewMode === 'day') {
      return _renderSingleDayItem({
        item: startDate,
        extraData: extraValues,
        index: 0,
        target: 'Cell',
      });
    }
    return (
      <View style={styles.multipleDayContainer}>
        {renderTextMonth()}
        {_renderMultipleDayItem({
          item: startDate,
          extraData: extraValues,
          index: 0,
          target: 'Cell',
        })}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {syncedLists ? _renderDayBarList() : _renderDayBarView()}
      {selectedEventId && <View style={styles.disabledFrame} />}
      {isLoading && <ProgressBar barColor={theme.loadingBarColor} />}
    </View>
  );
};

export default TimelineHeader;

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 22
  },
  dayName: {
    color: DEFAULT_PROPS.PRIMARY_COLOR,
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: 0.5
  },
  dayNumber: {
    color: DEFAULT_PROPS.PRIMARY_COLOR,
    fontSize: 13,
    lineHeight: 25,
    marginTop: 2
  },
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    zIndex: 99,
  },
  multipleDayContainer: { flexDirection: 'row'},
  disabledFrame: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
  },
});
