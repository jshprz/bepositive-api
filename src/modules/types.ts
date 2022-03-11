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