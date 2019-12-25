import * as moment from 'moment';

export function formatTime(milliseconds: number) {
  const duration = moment.duration(milliseconds);
  const hours = maybePadFront(Math.floor(duration.asHours()));
  const minutes = maybePadFront(Math.floor(duration.asMinutes() % 60));
  const seconds = maybePadFront(Math.trunc(duration.asSeconds() % 60));
  return `${hours}:${minutes}:${seconds}`;
}

export function maybePadFront(value: number | string, minLength?: number, padChar?: string) {
  minLength = minLength || 2;
  padChar = padChar || '0';
  let valueStr = value.toString();
  if (valueStr.length < minLength) {
    const padLength = minLength - valueStr.length;
    valueStr = padChar.repeat(padLength) + valueStr;
  }
  return valueStr;
}