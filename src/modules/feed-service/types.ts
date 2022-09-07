export type feedTypes = {
    content: {
        classification: string,
        postId: string,
        caption: string,
        googleMapsPlaceId: string,
        locationDetails: string,
        attachments: {
            key: string,
            url: string,
            type: string,
            height: string,
            width: string
        }[] | null,
        originalPost: {
            content: {
                postId: string,
                caption: string,
                googleMapsPlaceId: string,
                locationDetails: string,
                attachments: {
                    key: string
                    url: string,
                    type: string,
                    height: string,
                    width: string
                }[],
                createdAt: Date | number,
                updatedAt: Date | number
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
        } | null,
        isLiked: boolean,
        isSponsored: boolean | null,
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
} | null;

export type feedRawType = {
    id: string,
    userId: string,
    postId: string,
    classification: string,
    createdAt: Date | number
    updatedAt: Date | number
}