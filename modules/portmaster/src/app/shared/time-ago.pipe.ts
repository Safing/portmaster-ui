import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: number | Date, ticker?: any): string {
    const formats = [
      { ceiling: 1, text: "" },
      { ceiling: 60, text: "sec" },
      { ceiling: 3600, text: "min" },
      { ceiling: 86400, text: "hour" },
      { ceiling: 2629744, text: "day" },
      { ceiling: 31556926, text: "month" },
      { ceiling: Infinity, text: "year" }
    ];

    if (value instanceof Date) {
      value = value.valueOf() / 1000;
    }

    let diffInSeconds = Math.floor(((new Date()).valueOf() - (value * 1000)) / 1000);
    for (let i = formats.length - 1; i >= 0; i--) {
      const f = formats[i];
      let n = Math.floor(diffInSeconds / f.ceiling);
      if (n > 0) {
        if (i < 1) {
          return `< 1 min ago`
        }
        let text = formats[i + 1].text;
        if (n > 1) {
          text += 's';
        }
        return `${n} ${text} ago`
      }
    }

    return "< 1 min ago" // actually just now (diffInSeconds == 0)
  }
}
