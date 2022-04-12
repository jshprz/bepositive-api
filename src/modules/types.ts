export type userProfileType = {
  id: number,
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
  id: number,
  userId: string,
  postId: number,
  content: string,
  status: string,
  createdAt: Date | number,
  updatedAt: Date | number,
  user: {}
};

export type postType = {
  id: number,
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

export type feedTypes = {
  id: number,
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