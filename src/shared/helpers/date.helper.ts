class DateHelper {
  public getISODate(date: string) {
    return date.substr(0, 10);
  }
}

export const dateHelper = new DateHelper();
