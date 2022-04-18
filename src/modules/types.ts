export type userRelationshipTypes = {
  id: string,
  followeeId: string,
  followerId: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
};

export type getByIdAndUserCognitoSubReturnTypes = {
  id: string,
  postId: string,
  userId: string,
  shareCaption: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
};

export type getCommentsByPostIdReturnType = {
  id: string,
  userId: string,
  postId: string,
  content: string,
  status: string,
  createdAt: Date,
  updatedAt: Date,
  user: {}
};

export type getCommentByIdResult = {
  id: string,
  userId: string,
  postId: string,
  content: string,
  status: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
};

export type userProfileType = {
  id: string,
  userId: string,
  email: string,
  name: string,
  avatar: string,
  gender: string,
  profileTitle: string,
  profileDescription: string,
  dateOfBirth: string,
  website: string,
  city: string,
  state: string,
  zipcode: string,
  country: string,
  phoneNumber: string,
  isPublic: boolean,
  createdAt: Date | number,
  updatedAt: Date | number
}

export type s3UploadParamsType = {
  Bucket: string,
  Key: string,
  ContentType: string,
  Body: Buffer,
  ACL: string
};

export type timestampsType = {
  createdAt: Date | number,
  updatedAt: Date | number
};

export type commentType = {
  id: string,
  userId: string,
  postId: string,
  content: string,
  status: string,
  createdAt: Date | number,
  updatedAt: Date | number,
  user: {}
};

export type postType = {
  id: string,
  userId: string,
  caption: string,
  status: string,
  viewCount: number,
  googleMapsPlaceId: string,
  locationDetails: string,
  postMediaFiles: {key: string, type: string}[],
  createdAt: Date | number,
  updatedAt: Date | number
};

export type sharedPostType = {
  id: string,
  postId: string,
  userId: string,
  shareCaption: string,
  createdAt: Date | number,
  updatedAt: Date | number
};

export type feedTypes = {
  id: string,
  userId: string,
  caption: string,
  status: string,
  viewCount: number,
  googleMapsPlaceId: string,
  locationDetails: string,
  postMediaFiles: { key: string, type: string }[],
  createdAt: Date | number,
  updatedAt: Date | number,
  user: {}
};