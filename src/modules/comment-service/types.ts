export type getCommentByIdResult = {
    id: string,
    userId: string,
    commentId: string,
    postId: string,
    content: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
};

export type getCommentsByPostIdReturnType = {
    id: string,
    postId: string,
    content: string,
    status: string,
    isLiked: boolean,
    createdAt: Date | number,
    updatedAt: Date | number,
    actor: {
        userId: string,
        name: string,
        avatar: {
            url: string,
            type: string,
            height: string,
            width: string
        }
    },
    replies: any[]
};

export type getCommentRepliesByCommentIdReturnType = {
    id: string,
    commentId: string,
    content: string,
    isLiked: boolean,
    createdAt: Date | number,
    updatedAt: Date | number,
    actor: any,
    replies: any[]
};

export type commentType = {
    id: string,
    postId: string,
    content: string,
    status: string,
    createdAt: Date | number,
    updatedAt: Date | number,
    actor: {
        userId: string,
        name: string,
        avatar: {
            url: string,
            type: string,
            height: string,
            width: string
        }
    },
    replies: any[]
};