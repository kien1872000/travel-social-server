import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { TimeCheck } from '@util/enums';
export class StringHandlersHelper {
  public generateString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  public removeAccent(alias: string) {
    let str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      ' ',
    );
    str = str.replace(/ + /g, ' ');
    return str.trim();
  }
  public getHashtagFromString(description: string): string[] {
    let result = [];
    result = description.match(/#[a-zA-Z0-9_]+/g) as [string];
    if (!result) return [];
    return [...new Set(result)].map((ht) => ht.toLowerCase());
  }
  public getStartAndEndDate(tz: string): string[] {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    const end = dayjs().tz(tz).format();
    const start = dayjs().subtract(1, 'week').tz(tz).format();
    return [start, end];
  }
  public getDateWithTimezone(
    date: Date | string,
    tz: string,
    format?: string,
  ): string {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    if (!format) format = 'YYYY-MM-DDTHH:mm:ss';
    return dayjs(date).tz(tz).format(format);
  }
  public getStartAndEndDateWithTime(
    time: string,
    isStartOfTime?: boolean,
  ): string[] {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    const end = dayjs().utc();
    let start;
    switch (time) {
      case TimeCheck.Day:
        start = end.startOf('day').utc();
        break;
      case TimeCheck.Week:
        start = end.subtract(1, 'week').utc();
        if (isStartOfTime && isStartOfTime == true)
          start = end.startOf('week').utc();
        break;
      case TimeCheck.Month:
        start = end.subtract(1, 'month').utc();
        if (isStartOfTime && isStartOfTime == true)
          start = end.startOf('month').utc();
        break;
      case TimeCheck.Year:
      default:
        start = end.subtract(1, 'year').utc();
        if (isStartOfTime && isStartOfTime == true)
          start = end.startOf('year').utc();
        break;
    }

    return [start.format(), end.format()];
  }
}
