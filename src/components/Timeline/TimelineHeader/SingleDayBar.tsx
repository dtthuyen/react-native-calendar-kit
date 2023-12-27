import moment from 'moment-timezone';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import {DEFAULT_PROPS} from '../../../constants';
import type {DayBarItemProps} from '../../../types';
import {getDayBarStyle} from '../../../utils';

const SIZE_ARROW = 14;
const SingleDayBar = ({
                          width,
                          startDate,
                          theme,
                          locale,
                          highlightDates,
                          onPressDayNum,
                          currentDate,
                          tzOffset,
                          renderHeaderDay, 
                          renderLeftHeaderDay, 
                          renderRightHeaderDay
                      }: DayBarItemProps) => {
    const _renderDay = () => {
        const dateByIndex = moment.tz(startDate, tzOffset);
        const dateStr = dateByIndex.format('YYYY-MM-DD');
        const [dayNameText, dayNum] = dateByIndex
            .locale(locale)
            .format('dddd,DD/MM/YYYY')
            .split(',');
        const highlightDate = highlightDates?.[dateStr];

        const {dayName, dayNumber, dayNumberContainer} = getDayBarStyle(
            currentDate,
            dateByIndex,
            theme,
            highlightDate
        );

        return (
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                {renderLeftHeaderDay ? (
                    renderLeftHeaderDay()
                ) : null}

                <View style={styles.dayItem}>
                    {renderHeaderDay ? renderHeaderDay() : (
                        <Text
                            allowFontScaling={theme.allowFontScaling}
                            style={[styles.dayName, dayName]}
                        >
                            {dayNameText}
                        </Text>
                    )}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        disabled={!onPressDayNum}
                        onPress={() => onPressDayNum?.(dateStr)}
                        style={[styles.dayNumBtn, dayNumberContainer]}
                    >
                        <Text
                            allowFontScaling={theme.allowFontScaling}
                            style={[styles.dayNumber, dayNumber]}
                        >
                            {renderHeaderDay ? dayNameText + ' ' : ''}{dayNum}
                        </Text>
                    </TouchableOpacity>
                </View>

                {renderRightHeaderDay ? (
                    renderRightHeaderDay()
                ) : null}
            </View>

        );
    };

    return (
        <View
            style={[
                styles.container,
                {width, height: DEFAULT_PROPS.DAY_BAR_HEIGHT},
            ]}
        >
            {_renderDay()}
        </View>
    );
};

export default SingleDayBar;

const styles = StyleSheet.create({
    container: {alignItems: 'center', flexDirection: 'row'},
    dayItem: {alignItems: 'center', flex: 1},
    dayNumBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        marginTop: 2,
        height: 28,
    },
    dayName: {color: DEFAULT_PROPS.SECONDARY_COLOR, fontSize: 12},
    dayNumber: {color: DEFAULT_PROPS.SECONDARY_COLOR, fontSize: 16},
});
