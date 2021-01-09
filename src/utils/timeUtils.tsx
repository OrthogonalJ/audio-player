import moment from 'moment';
import NotImplementedError from '../exceptions/notImplementedError';

export function formatDate(millisecSinceEpoch: number, format = 'DD MMM YYYY'): string {
  return moment(millisecSinceEpoch).format(format);
}

export enum TimeFormat {
  HHMMSS,
  MMSS
}

export function formatTime(milliseconds: number, format = TimeFormat.HHMMSS): string {
  const duration = moment.duration(milliseconds);
  let hours, minutes, seconds;
  switch (format) {
    case TimeFormat.HHMMSS:
      hours = maybePadFront(Math.floor(duration.asHours()));
      minutes = maybePadFront(Math.floor(duration.asMinutes() % 60));
      seconds = maybePadFront(Math.trunc(duration.asSeconds() % 60));
      return `${hours}:${minutes}:${seconds}`;
    case TimeFormat.MMSS:
      minutes = maybePadFront(Math.floor(duration.asMinutes()));
      seconds = maybePadFront(Math.trunc(duration.asSeconds() % 60));
      return `${minutes}:${seconds}`
    default:
      throw new NotImplementedError(`formatTime does not support format ${format} (format must be a member of the TimeFormat enum)`);
  }
}

export function maybePadFront(value: number | string, minLength = 2, padChar = '0'): string {
  let valueStr = value.toString();
  if (valueStr.length < minLength) {
    const padLength = minLength - valueStr.length;
    valueStr = padChar.repeat(padLength) + valueStr;
  }
  return valueStr;
}