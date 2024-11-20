class DTFormator {
  date: string;
  time: string;

  constructor(date: string, time: string) {
    this.date = date;
    this.time = time;
  }

  static formatTimestamp(timestamp: number): DTFormator {
    const isoString = new Date(timestamp * 1000).toISOString();
    const formattedDateTime = DTFormator.formatDateTime(isoString);
    return new DTFormator(formattedDateTime.date, formattedDateTime.time);
  }

  toString(): string {
    return `${this.date} ${this.time}`;
  }

  static formatDateTime(isoString: string): DTFormator {
    // Parse the ISO 8601 string into a Date object
    const dateObject = new Date(isoString);

    // Extract the date components
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = dateObject.getDate().toString().padStart(2, "0");

    // Extract the time components
    const hours = dateObject.getHours().toString().padStart(2, "0");
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");
    const seconds = dateObject.getSeconds().toString().padStart(2, "0");

    // Format the date and time separately
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return new DTFormator(formattedDate, formattedTime);
  }
}

export default DTFormator;
