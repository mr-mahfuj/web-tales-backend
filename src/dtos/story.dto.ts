export interface CreateStoryDTO {
    userId: string;
    title: string;
    body: string;
}

export interface UpdateStoryDTO {
    title?: string;
    body?: string;
}

export interface StoryDTO {
    userId: string;
    storyId: string;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}
