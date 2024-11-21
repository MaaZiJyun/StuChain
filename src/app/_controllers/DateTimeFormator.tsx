class DTFormator {
  date: string;
  time: string;

  constructor(date: string, time: string) {
    this.date = date;
    this.time = time;
  }

  static formatTimestamp(timestamp: number): DTFormator {
    try {
      
      if (timestamp.toString().length === 10) {
        timestamp > 1000000000000 ? timestamp : timestamp * 1000
      }
      const isoString = new Date(timestamp).toISOString();
      const formattedDateTime = DTFormator.formatDateTime(isoString);
      return new DTFormator(formattedDateTime.date, formattedDateTime.time);
    } catch (error) {
     return  new DTFormator("", "");
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
