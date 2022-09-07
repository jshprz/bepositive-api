export type searchHashtagType = {
  classification: string,
  hashtagId: string,
  name: string
}

export type searchUserType = {
  classification: string,
  userId: string,
  name: string,
  avatar: string,
  profileTitle: string
}

export type timestampsType = {
  createdAt: Date | number,
  updatedAt: Date | number
};