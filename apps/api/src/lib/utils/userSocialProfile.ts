export type UserSocialProfileFields = {
  name?: string;
  userName?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
};

export const buildUserSocialProfileUpdate = (
  fields: UserSocialProfileFields,
): Record<string, string> => {
  const update: Record<string, string> = {};
  if (fields.name !== undefined) {
    update.name = fields.name;
  }
  if (fields.userName !== undefined) {
    update.userName = fields.userName;
  }
  if (fields.linkedInUrl !== undefined) {
    update.linkedInUrl = fields.linkedInUrl;
  }
  if (fields.githubUrl !== undefined) {
    update.githubUrl = fields.githubUrl;
  }
  if (fields.leetCodeUrl !== undefined) {
    update.leetCodeUrl = fields.leetCodeUrl;
  }
  return update;
};
