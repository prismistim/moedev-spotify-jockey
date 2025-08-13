type Poll = {
  choices: string[];
  multiple: boolean;
  expiresAt: null;
  expiredAfter: null;
}

type reactionAcceptance = 'likeOnly' | 'likeOnlyForRemote' | 'nonSensitiveOnly' | 'nonSensitiveOnlyForLocalLikeOnlyForRemote'

type visibility = 'public' | 'home' | 'followers' | 'specified'

export type Note = {
  visibility: visibility;
  visibleUserIds?: string[];
  cw?: string;
  localOnly: boolean;
  reactionAcceptance?: reactionAcceptance;
  noExtractMentions?: boolean;
  noExtractHashtags?: boolean;
  noExtractEmojis?: boolean;
  replyId?: null;
  renoteId?: null;
  channelId?: null;
  text: string;
  fileIds?: string[];
  mediaIds?: string[];
  poll?: Poll;
}
