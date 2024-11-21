export class EventClass {
  fromAddress: string;
  toAddress: string;
  amount: number; // Use `string` or `number` based on your requirements
  changeAddress: string;
  stuId: string;
  teacherId: string;
  eventId: string;
  deadline: string;
  remark: string; // Nullable field
  timestamp?: number;

  constructor(
    fromAddress: string,
    toAddress: string,
    amount: number,
    changeAddress: string,
    stuId: string,
    teacherId: string,
    eventId: string,
    deadline: string,
    remark: string, // Optional parameter
    timestamp?: number
  ) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.changeAddress = changeAddress;
    this.stuId = stuId;
    this.teacherId = teacherId;
    this.eventId = eventId;
    this.deadline = deadline;
    this.remark = remark || "";
    this.timestamp = timestamp || 0;
  }

  // Convert an instance of EventClass to a JSON object
  toJSON(): object {
    return {
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount,
      changeAddress: this.changeAddress,
      stuId: this.stuId,
      teacherId: this.teacherId,
      eventId: this.eventId,
      deadline: this.deadline,
      remark: this.remark,
    };
  }

  // Create an instance of EventClass from a JSON object
  static fromJSON(json: any): EventClass {
    return new EventClass(
      json.fromAddress,
      json.toAddress,
      json.amount,
      json.changeAddress,
      json.stuId,
      json.teacherId,
      json.eventId,
      json.deadline,
      json.remark,
      json.timestamp
    );
  }
}
