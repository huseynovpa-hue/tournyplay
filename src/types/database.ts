export type RoomStatus =
  | "open"
  | "full"
  | "reported"
  | "completed"
  | "disputed"
  | "expired"
  | "cancelled";

export type Profile = {
  id: string;
  profile_name: string;
  efootball_username: string;
  token_balance: number;
  created_at: string;
};

export type Room = {
  id: string;
  creator_id: string;
  opponent_id: string | null;
  stake: number;
  status: RoomStatus;
  created_at: string;
  full_at: string | null;
  expires_at: string | null;
  room_code: string | null;
  started_at: string | null;
  finished_at: string | null;
  creator_ready_at: string | null;
  opponent_ready_at: string | null;
  creator?: Profile;
  opponent?: Profile | null;
  result?: RoomResult | null;
};

export type RoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
};

export type ResultStatus = "pending" | "approved" | "disputed";

export type RoomResult = {
  id: string;
  room_id: string;
  reporter_id: string;
  winner_id: string;
  score_winner: number;
  score_loser: number;
  screenshot_url: string;
  status: ResultStatus;
  created_at: string;
  approved_at: string | null;
};

export type TokenTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "room_stake" | "room_win" | "refund" | "admin_adjust";
  room_id: string | null;
  created_at: string;
};

export type PlayerStats = {
  user_id: string;
  profile_name: string;
  efootball_username: string;
  matches_played: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  tokens_won: number;
  tokens_staked?: number;
};

export type PlayerMatchHistoryItem = {
  room_id: string;
  stake: number;
  finished_at: string | null;
  opponent_id: string | null;
  opponent_name: string | null;
  score_for: number;
  score_against: number;
  won: boolean;
};
