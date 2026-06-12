export declare class CreateBookingDto {
    talentId: string;
    title: string;
    description: string;
    budget: number;
    startDate: Date;
    endDate?: Date;
    requirements?: string[];
    deliverables?: string[];
}
