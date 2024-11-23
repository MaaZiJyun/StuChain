class DTFormator {
  date: string;
  time: string;

  constructor(date: string, time: string) {
    this.date = date;
    this.time = time;
  }

  static formatTimestamp(timestamp: number): DTFormator {
    try {
      // Convert timestamp to milliseconds if in seconds
      if (timestamp.toString().includes(".")) {
        timestamp *= 1000; // Convert to milliseconds
      }

      // Create a date object from the timestamp
      const isoString = new Date(timestamp).toUTCString();

      // Format the date and time
      const formattedDateTime = DTFormator.formatDateTime(isoString);

      // Return a new instance of DTFormator with formatted date and time
      return new DTFormator(formattedDateTime.date, formattedDateTime.time);
    } catch (error) {
      console.error("Error formatting timestamp:", error); // Log the error for debugging
      return new DTFormator("", "");
    }
  }

  toString(): string {
    return `${this.date} ${this.time}`;
  }

  static formatDateTime(isoString: string): DTFormator {
    const dateObject = new Date(isoString);

    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");

    const hours = dateObject.getHours().toString().padStart(2, "0");
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");
    const seconds = dateObject.getSeconds().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return new DTFormator(formattedDate, formattedTime);
  }
}

export default DTFormator;
