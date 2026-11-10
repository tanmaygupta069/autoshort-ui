export type Role = "admin" | "reviewer";

export interface Me { id: string; email: string; name: string; role: Role }

export interface Topic {
  topic_id: string;
  channel: string;
  topic: string;
  notes_for_ai: string;
  priority: number;
  status: string;
  source: "human" | "research";
  version: number;
  failure_reason: string;
  youtube_channel: string;
  instagram_handle: string;
}

export interface Draft {
  topic_id: string;
  draft: number;
  channel: string;
  status: string;
  video_file: string;
  duration_s: string | number | null;
  yt_title: string;
  yt_description: string;
  yt_hashtags: string;
  ig_caption: string;
  ig_hashtags: string;
  qa_result: string;
  feedback: string;
  updated_at: string;
}

export interface Note { id: string; draft_id: string | null; kind: string; body: string; author: string | null; created_at: string; consumed_at: string | null }
export interface EventRow { id: number; at: string; actor_kind: string; actor: string | null; type: string; from_status: string | null; to_status: string | null; data: Record<string, unknown> | null }
export interface TopicDetail extends Topic { drafts: Draft[]; notes: Note[]; events: EventRow[] }

export interface Summary {
  topics: Record<string, number>;
  drafts: Record<string, number>;
  first_drafts_today: number;
  daily_cap: number;
  last_research: string | null;
}

export interface UserRow { id: string; email: string; name: string; role: Role; active: boolean; created_at: string; last_login_at: string | null }
export interface WaitlistRow { id: string; email: string; status: "waiting" | "invited" | "dismissed"; niche: string; requests: number; first_at: string; last_at: string; notified_at: string | null; decided_at: string | null }
export interface SessionRow { sid: string; created: number; ip: string; ua: string; current: boolean }
export interface Channel { id: string; display_name: string; niche: string; audience: string; tone: string; style_pack: string; youtube_channel: string; instagram_handle: string; daily_cap: number | null; research_min_pending: number | null; active: boolean; status: "generating" | "ready" | "active" | "failed"; profile_error: string }
export interface ChannelDetail extends Channel { profile: Record<string, unknown> | null }
