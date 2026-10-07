export type DeliveryType =
    | 'dot'
    | 'four'
    | 'six'
    | 'wide'
    | 'noball'
    | 'wicket';

export type DismissalType =
    | 'caught'
    | 'bowled'
    | 'offside' 
    | 'retired-out'
    | null;

export interface MatchDelivery {
    // Innings & delivery order
    innings: 1 | 2;
    deliveryNumber: number;
    overNumber: number;
    ballNumber: number;

    // Players
    batsmanId: string;
    bowlerId: string;

    // Result
    type: DeliveryType;

    // Runs
    batterRuns: number;
    totalRuns: number;

    // Ball legality
    legalBall: boolean;

    // Wicket
    wicket: boolean;
    dismissalType: DismissalType;
    dismissedBatsmanId: string | null;

    // Catcher, only when caught
    caughtById: string | null;
}