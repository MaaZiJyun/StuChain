// Define the EventClass
class EventClass {
  eventId: string;
  hostId: string;
  date: string;
  time: string;
  remark: string;

  constructor(
    eventId: string,
    hostId: string,
    date: string,
    time: string,
    remark: string
  ) {
    this.eventId = eventId;
    this.hostId = hostId;
    this.date = date;
    this.time = time;
    this.remark = remark;
  }

  // Method to convert class instance to JSON
  toJSON(): string {
    return JSON.stringify({
      eventId: this.eventId,
      hostId: this.hostId,
      date: this.date,
      time: this.time,
      remark: this.remark,
    });
  }

  // Static method to create an instance from a Transaction JSON
  static fromJSON(jsonString: string): EventClass {
    const data = JSON.parse(jsonString);

    // Assuming the Transaction JSON has a deadline field in 'YYYY-MM-DDTHH:MM:SS' format
    const [date, time] = data.deadline.split("T");

    return new EventClass(
      data.eventId, // Mapping eventId directly
      data.teacherId, // Assuming teacherId corresponds to hostId
      date, // Extracted date part from deadline
      time, // Extracted time part from deadline
      data.remark // Mapping remark directly
    );
  }
}
