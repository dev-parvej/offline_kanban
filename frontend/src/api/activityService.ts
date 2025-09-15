import { api } from "./axios";

export interface Activity {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  username: string;
}

export interface ActivityResponse {
  activity: Activity;
}

export interface ActivityListResponse {
  activities: Activity[];
  total: number;
}

export interface GetActivitiesParams {
  entity_type?: string;
  entity_id?: number;
  limit?: number;
  offset?: number;
}

// Get activities with optional filters
export const getActivities = async (params?: GetActivitiesParams): Promise<ActivityListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.entity_type) searchParams.append('entity_type', params.entity_type);
  if (params?.entity_id) searchParams.append('entity_id', params.entity_id.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const response = await api.get(`/activities?${searchParams.toString()}`);
  return response.data;
};

// Get activities for a specific task
export const getTaskActivities = async (taskId: number): Promise<ActivityListResponse> => {
  const response = await api.get(`/activities/task/${taskId}`);
  return response.data;
};

// Get single activity
export const getActivity = async (id: number): Promise<ActivityResponse> => {
  const response = await api.get(`/activities/${id}`);
  return response.data;
};