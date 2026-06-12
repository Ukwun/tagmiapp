export declare class CreateRoomDto {
    name: string;
    type?: "direct" | "group" | "booking";
    bookingId?: string;
    participants?: string[];
}
