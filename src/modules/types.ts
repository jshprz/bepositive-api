export type postsHashtagsType = {
  id: string,
  postId: string,
  hashtagId: string,
  createdAt: Date | number,
  updatedAt: Date | number
}

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

export type getHashtagType = {
  id: string,
  name: string,
  createdAt: Date | number,
  updatedAt: Date | number
}



export type getCommentLikeType = {
  id: string,
  commentId: string,
  userId: string,
  createdAt: Date | number,
  updatedAt: Date | number
}



export type timestampsType = {
  createdAt: Date | number,
  updatedAt: Date | number
};


export type advertisementType = {
  content: {
    classification: string,
    advertisementId: string,
    caption: string,
    googleMapsPlaceId: string,
    locationDetails: string,
    link: string,
    attachments: ({
      key: string,
      url: string,
      type: string,
      height: string,
      width: string
    }[] & {
      key: string,
      type: string
    }[]) | null,
    isSponsored: boolean | null,
    createdAt: Date | number,
    updatedAt: Date | number,
  },
  actor: {
    userId: string | null,
    name: string,
    avatar: {
      url: string,
      type: string,
      height: string,
      width: string
    }
  }
};

export type advertisementFeedTypes = {
  content: {
    classification: string,
    advertisementId: string,
    caption: string,
    googleMapsPlaceId: string,
    locationDetails: string,
    link: string,
    attachments: ({
      key: string,
      url: string,
      type: string,
      height: string,
      width: string
    }[] & {
      key: string,
      type: string
    }[]) | null,
    originalPost: null,
    isLiked: boolean | null,
    isSponsored: boolean | null,
    createdAt: Date | number,
    updatedAt: Date | number,
  },
  actor: {
    userId: string | null,
    name: string,
    avatar: {
      url: string,
      type: string,
      height: string,
      width: string
    }
  }
} | null;