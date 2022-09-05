export type getPostLikeType = {
    id: string,
    postId: string,
    userId: string,
    createdAt: Date | number,
    updatedAt: Date | number
}

export type postType = {
    content: {
        classification: string,
        postId: string,
        caption: string,
        googleMapsPlaceId: string,
        locationDetails: string,
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
        isLiked: boolean,
        createdAt: Date | number,
        updatedAt: Date | number,
    },
    actor: {
        userId: string,
        name: string,
        avatar: {
            url: string,
            type: string,
            height: string,
            width: string
        }
    }
};

export type sharedPostType = {
    id: string,
    postId: string,
    userId: string,
    shareCaption: string,
    createdAt: Date | number,
    updatedAt: Date | number
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